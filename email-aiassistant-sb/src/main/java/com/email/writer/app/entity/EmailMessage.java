package com.email.writer.app.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "email_messages")
public class EmailMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sender;

    private String recipient;

    @Column(columnDefinition = "text")
    private String body;

    // position in thread so you know the order (0,1,2,...)
    @Column(name = "position_in_thread")
    private int position;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "thread_id")
    private EmailThread thread;

    public Long getId() {
        return id;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getRecipient() {
        return recipient;
    }

    public void setRecipient(String recipient) {
        this.recipient = recipient;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public int getPosition() {
        return position;
    }

    public void setPosition(int position) {
        this.position = position;
    }

    public EmailThread getThread() {
        return thread;
    }

    public void setThread(EmailThread thread) {
        this.thread = thread;
    }
}
