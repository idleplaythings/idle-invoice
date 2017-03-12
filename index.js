const _ = require('lodash')
const google = require('googleapis')
const drive = google.drive('v3')
const sheets = google.sheets('v4')
const AWS = require('aws-sdk');

const INVOICE_SPREADSHEET_ID = process.env.INVOICE_SPREADSHEET_ID
const INVOICE_FOLDER_ID = process.env.INVOICE_FOLDER_ID
const JWT_CLIENT_EMAIL = process.env.JWT_CLIENT_EMAIL
const JWT_PRIVATE_KEY_ENCRYPTED = process.env.JWT_PRIVATE_KEY
let JWT_PRIVATE_KEY_DECRYPTED
const JWT_SCOPES = process.env.JWT_SCOPES.split(',').map(scope => _.trim(scope))

// http://cwestblog.com/2013/09/05/javascript-snippet-convert-number-to-column-name/
function toColumnName(num) {
  for (var ret = '', a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
    ret = String.fromCharCode(parseInt((num % b) / a) + 65) + ret;
  }
  return ret;
}

const processEvent = (event, context, callback) => {
  const authClient = new google.auth.JWT(
    JWT_CLIENT_EMAIL,
    null,
    JWT_PRIVATE_KEY_DECRYPTED,
    JWT_SCOPES,
    null  
  )
  
  authClient.authorize((err, tokens) => {
    if (err) {
      callback(err)
      return
    }

    sheets.spreadsheets.values.get({ 
      auth: authClient,
      spreadsheetId: INVOICE_SPREADSHEET_ID,
      range: 'lineItems!A1:F99999',
    }, (err, lineItemResp) => {
      if (err) {
        callback(err)
        return
      }

      const lineItemHeaders = lineItemResp.values.shift()
      const lineItemRows = lineItemResp.values.map(row => _.zipObject(lineItemHeaders, row))

      sheets.spreadsheets.values.get({ 
        auth: authClient,
        spreadsheetId: INVOICE_SPREADSHEET_ID,
        range: 'invoices!A1:R99999',
      }, (err, invoiceResp) => {
        if (err) {
          callback(err)
          return
        }

        const invoiceHeaders = invoiceResp.values.shift()
        const processingColumn = toColumnName(invoiceHeaders.indexOf('processing') + 1)
        const processedColumn = toColumnName(invoiceHeaders.indexOf('processed') + 1)

        const invoiceRows = invoiceResp.values.map(row => _.zipObject(invoiceHeaders, row))

        invoiceRows
          .forEach((invoiceRow, invoiceRowIndex) => {
            if (!invoiceRow.approved || invoiceRow.processing || invoiceRow.processed) {
              return
            }

            sheets.spreadsheets.values.update({
              auth: authClient,
              spreadsheetId: INVOICE_SPREADSHEET_ID,
              range: `invoices!${processingColumn}${invoiceRowIndex+2}:${processingColumn}${invoiceRowIndex+2}`,
              valueInputOption: 'RAW',
              resource: {
                values: [['1']],
              },              
            }, (err, resp) => {
              if (err) {
                callback(err)
                return
              }
            })

            const invoice = Object.assign({}, invoiceRow, {
                lineItems: lineItemRows.filter(lineItemRow => lineItemRow.invoiceNo === invoiceRow.invoiceNo)
            })

            console.log(invoice)

            // drive.files.list({ auth: authClient }, (err, resp) => {
            //   if (err) {
            //     callback(err)
            //     return
            //   }

            //   console.log(resp)
            // })

            // drive.files.delete({
            //   auth: authClient,
            //   fileId: '0BzC3vPq-MFD4RzVfQzh6TVQyNTg',
            // }, (err, resp) => {
            //   if (err) {
            //     callback(err)
            //     return
            //   }

            //   console.log(resp)
            // })


            const LineItem = require('./src/line-item').LineItem;
            const Invoice = require('./src/invoice').Invoice;
            const PdfRenderer = require('./src/renderer/pdf').PdfRenderer;
            const Translation = require('./src/translation').Translation;

            const pdfInvoice = new Invoice(invoice);

            const translation = new Translation('./translation/' + pdfInvoice.getLanguage() + '.json');

            const renderer = new PdfRenderer(translation.getTranslator());

            //var Writable = require('stream').Writable;
            //var Readable = require('stream').Readable;

            //var writableStream = new Writable;
            //var readableStream = new Readable;

            //readableStream.pipe(writableStream)

            //renderer.render(pdfInvoice, writableStream);

            renderer.render(pdfInvoice)
            renderer._pdf.end()

            drive.files.create({
              auth: authClient,
              resource: {
                parents: [INVOICE_FOLDER_ID],
                name: `invoice-${invoice.invoiceNo}.pdf`,
                mimeType: 'application/pdf',              
              },            
              media: {
                body: renderer._pdf,
              },
              permissions: [
                {
                  type: 'domain',
                  domain: '@idleplaythings.com',
                  role: 'owner',
                },
              ],
            }, (err, resp) => {
              if (err) {
                callback(err)
                return
              }

              sheets.spreadsheets.values.update({
                auth: authClient,
                spreadsheetId: INVOICE_SPREADSHEET_ID,
                range: `invoices!${processedColumn}${invoiceRowIndex+2}:${processedColumn}${invoiceRowIndex+2}`,
                valueInputOption: 'RAW',
                resource: {
                  values: [['1']],
                },              
              }, (err, resp) => {
                if (err) {
                  callback(err)
                  return
                }

                callback(null)
              })

              // drive.files.list({ auth: authClient }, (err, resp) => {
              //   if (err) {
              //     callback(err)
              //     return
              //   }
              // })
            })
          })
      })
    })
  })
}

exports.handler = (event, context, callback) => {
    if (JWT_PRIVATE_KEY_DECRYPTED) {
        processEvent(event, context, callback);
    } else {
        // Decrypt code should run once and variables stored outside of the function
        // handler so that these are decrypted once per container
        const kms = new AWS.KMS();
        kms.decrypt({ CiphertextBlob: new Buffer(JWT_PRIVATE_KEY_ENCRYPTED, 'base64') }, (err, data) => {
            if (err) {
                console.log('Decrypt error:', err);
                return callback(err);
            }
            JWT_PRIVATE_KEY_DECRYPTED = data.Plaintext.toString('ascii');
            processEvent(event, context, callback);
        });
    }
};
