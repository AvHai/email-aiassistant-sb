// package com.email.writer.app;

// import lombok.Data;

// @Data
// public class EmailRequest {
//     private String emailContent;
//     private String tone;
// }


package com.email.writer.app;

import lombok.Data;

import java.util.List;

@Data
public class EmailRequest {

    /**
     * Subject of the email thread.
     */
    private String subject;

    /**
     * Full email thread (one or more messages).
     * We'll build the prompt from this if it's present.
     */
    private List<EmailMessageDTO> messages;

    /**
     * Optional: legacy single-email field, kept for backward compatibility.
     * If 'messages' is null/empty, we fall back to this.
     */
    private String emailContent;

    /**
     * Desired tone: "formal", "friendly", or "concise".
     * We'll still handle other strings, but these three are the target ones.
     */
    private String tone;
}

