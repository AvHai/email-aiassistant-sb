package com.email.writer.app.repository;

import com.email.writer.app.entity.EmailThread;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailThreadRepository extends JpaRepository<EmailThread, Long> {
}
