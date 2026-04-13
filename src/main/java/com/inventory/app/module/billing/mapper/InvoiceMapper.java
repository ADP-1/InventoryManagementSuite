package com.inventory.app.module.billing.mapper;

import com.inventory.app.module.billing.dto.response.InvoiceItemResponse;
import com.inventory.app.module.billing.dto.response.InvoiceResponse;
import com.inventory.app.module.billing.entity.Invoice;
import com.inventory.app.module.billing.entity.InvoiceItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface InvoiceMapper {

    @Mapping(target = "customerId",    source = "customer.id")
    @Mapping(target = "customerName",  source = "customer.name")
    @Mapping(target = "customerEmail", source = "customer.email")
    @Mapping(target = "createdById",   source = "user.id")
    @Mapping(target = "createdByName", source = "user.name")
    @Mapping(target = "items",         source = "items")
    InvoiceResponse toResponse(Invoice invoice);

    @Mapping(target = "productId",   source = "product.id")
    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "productSku",  source = "product.sku")
    InvoiceItemResponse toItemResponse(InvoiceItem item);
}
