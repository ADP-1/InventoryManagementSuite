package com.inventory.app.common.util;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class InvoiceNumberGenerator {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    private volatile String currentDate = LocalDate.now().format(DATE_FORMATTER);
    private final AtomicLong sequence = new AtomicLong(0);

    public synchronized String generate() {
        String today = LocalDate.now().format(DATE_FORMATTER);

        // Reset sequence when day changes
        if (!today.equals(currentDate)) {
            currentDate = today;
            sequence.set(0);
        }

        long nextSeq = sequence.incrementAndGet();
        return String.format("INV-%s-%05d", today, nextSeq);
    }
}
