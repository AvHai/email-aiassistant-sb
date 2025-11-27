package com.email.writer.app.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "generated_replies")
public class GeneratedReply {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "thread_id")
    private EmailThread thread;

    private String tone;

    @Column(name = "reply_body", columnDefinition = "text")
    private String replyBody;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Long getId() {
        return id;
    }

    public EmailThread getThread() {
        return thread;
    }

    public void setThread(EmailThread thread) {
        this.thread = thread;
    }

    public String getTone() {
        return tone;
    }

    public void setTone(String tone) {
        this.tone = tone;
    }

    public String getReplyBody() {
        return replyBody;
    }

    public void setReplyBody(String replyBody) {
        this.replyBody = replyBody;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
