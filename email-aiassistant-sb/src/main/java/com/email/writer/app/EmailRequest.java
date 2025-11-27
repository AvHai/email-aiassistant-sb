

package com.email.writer.app;

import lombok.Data;

import java.util.List;

@Data
public class EmailRequest {

   
    private String subject;
    
    private List<EmailMessageDTO> messages;
    
    private String emailContent;

    private String tone;
}

