package com.inventory.app.module.billing.service;

import com.inventory.app.common.exception.ResourceNotFoundException;
import com.inventory.app.module.billing.entity.Invoice;
import com.inventory.app.module.billing.entity.InvoiceItem;
import com.inventory.app.module.billing.repository.InvoiceRepository;
import com.itextpdf.html2pdf.HtmlConverter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvoicePdfService {

    private final InvoiceRepository invoiceRepository;

    @Transactional(readOnly = true)
    public byte[] generatePdf(UUID invoiceId) {
        Invoice invoice = invoiceRepository.findByIdWithDetails(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "id", invoiceId));

        String htmlContent = buildHtmlTemplate(invoice);
        ByteArrayOutputStream target = new ByteArrayOutputStream();
        HtmlConverter.convertToPdf(htmlContent, target);
        return target.toByteArray();
    }

    private String buildHtmlTemplate(Invoice invoice) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm");
        StringBuilder itemsHtml = new StringBuilder();

        for (InvoiceItem item : invoice.getItems()) {
            itemsHtml.append(String.format(
                "<tr>" +
                "<td>%s</td>" +
                "<td>%s</td>" +
                "<td style='text-align: center;'>%d</td>" +
                "<td style='text-align: right;'>₹%.2f</td>" +
                "<td style='text-align: right;'>₹%.2f</td>" +
                "</tr>",
                item.getProduct().getName(),
                item.getProduct().getSku(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getTotalPrice()
            ));
        }

        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<style>" +
                "body { font-family: Arial, sans-serif; color: #333; margin: 40px; }" +
                ".header { display: flex; justify-content: space-between; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; }" +
                ".title { color: #4f46e5; font-size: 24px; font-weight: bold; }" +
                ".invoice-info { margin-top: 30px; display: flex; justify-content: space-between; }" +
                ".bill-to { margin-top: 20px; }" +
                "table { width: 100%; border-collapse: collapse; margin-top: 30px; }" +
                "th { background-color: #f9fafb; color: #6b7280; text-transform: uppercase; font-size: 12px; padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: left; }" +
                "td { padding: 12px; border-bottom: 1px solid #f3f4f6; font-size: 14px; }" +
                ".totals { margin-top: 30px; float: right; width: 250px; }" +
                ".total-row { display: flex; justify-content: space-between; padding: 8px 0; }" +
                ".grand-total { border-top: 2px solid #e5e7eb; margin-top: 10px; padding-top: 10px; font-weight: bold; font-size: 18px; color: #4f46e5; }" +
                ".footer { margin-top: 100px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; }" +
                ".status-badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 10px; font-weight: bold; text-transform: uppercase; }" +
                ".PAID { background-color: #d1fae5; color: #065f46; }" +
                ".ISSUED { background-color: #dbeafe; color: #1e40af; }" +
                ".DRAFT { background-color: #f3f4f6; color: #374151; }" +
                ".CANCELLED { background-color: #fee2e2; color: #991b1b; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='header'>" +
                "<div><div class='title'>Inventory & Billing System</div></div>" +
                "<div style='text-align: right;'>" +
                "<div class='status-badge " + invoice.getStatus() + "'>" + invoice.getStatus() + "</div>" +
                "</div>" +
                "</div>" +
                "<div class='invoice-info'>" +
                "<div>" +
                "<strong>Invoice #:</strong> " + invoice.getInvoiceNumber() + "<br/>" +
                "<strong>Date:</strong> " + invoice.getCreatedAt().format(formatter) +
                "</div>" +
                "</div>" +
                "<div class='bill-to'>" +
                "<strong>Bill To:</strong><br/>" +
                invoice.getCustomer().getName() + "<br/>" +
                invoice.getCustomer().getEmail() + "<br/>" +
                (invoice.getCustomer().getPhone() != null ? invoice.getCustomer().getPhone() : "") +
                "</div>" +
                "<table>" +
                "<thead><tr><th>Product</th><th>SKU</th><th style='text-align: center;'>Qty</th><th style='text-align: right;'>Unit Price</th><th style='text-align: right;'>Total</th></tr></thead>" +
                "<tbody>" + itemsHtml.toString() + "</tbody>" +
                "</table>" +
                "<div class='totals'>" +
                "<div class='total-row'><span>Subtotal:</span><span>₹" + String.format("%.2f", invoice.getSubtotal()) + "</span></div>" +
                "<div class='total-row'><span>Tax (" + invoice.getTaxPercent() + "%):</span><span>₹" + String.format("%.2f", invoice.getTax()) + "</span></div>" +
                "<div class='total-row'><span>Discount:</span><span style='color: #dc2626;'>-₹" + String.format("%.2f", invoice.getDiscount()) + "</span></div>" +
                "<div class='total-row grand-total'><span>Grand Total:</span><span>₹" + String.format("%.2f", invoice.getTotal()) + "</span></div>" +
                "</div>" +
                "<div style='clear: both;'></div>" +
                "<div style='margin-top: 40px;'>" +
                "<strong>Notes:</strong><br/>" +
                "<p style='font-size: 14px; color: #6b7280;'>" + (invoice.getNotes() != null ? invoice.getNotes() : "No additional notes.") + "</p>" +
                "</div>" +
                "<div class='footer'>Thank you for your business!<br/>Generated by Inventory & Billing System</div>" +
                "</body>" +
                "</html>";
    }
}
