package com.email.writer.app;

import lombok.Data;


@Data
public class EmailMessageDTO {

   
    private String sender;

    
    private String recipient;

   
    private String body;

    private String sentAt;
}
