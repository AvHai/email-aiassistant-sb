package com.email.writer.app;

import lombok.Data;

/**
 * Represents a single email inside a thread.
 */
@Data
public class EmailMessageDTO {

    // Who sent this particular email
    private String sender;

    // (Optional) Who it was sent to
    private String recipient;

    // The actual email body
    private String body;

    // (Optional) When it was sent, ISO string is fine: 2025-11-25T10:30:00Z
    private String sentAt;
}
