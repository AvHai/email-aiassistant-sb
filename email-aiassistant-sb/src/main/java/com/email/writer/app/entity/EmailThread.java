package com.email.writer.app.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "email_threads")
public class EmailThread {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String subject;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    // Optional: later you can add an owner identifier (user/session)

    @OneToMany(
            mappedBy = "thread",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<EmailMessage> messages = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public List<EmailMessage> getMessages() {
        return messages;
    }

    public void addMessage(EmailMessage message) {
        messages.add(message);
        message.setThread(this);
    }
}
