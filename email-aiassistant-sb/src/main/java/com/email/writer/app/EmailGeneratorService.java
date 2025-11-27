package com.email.writer.app;

import com.email.writer.app.entity.EmailMessage;
import com.email.writer.app.entity.EmailThread;
import com.email.writer.app.entity.GeneratedReply;
import com.email.writer.app.repository.EmailMessageRepository;
import com.email.writer.app.repository.EmailThreadRepository;
import com.email.writer.app.repository.GeneratedReplyRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class EmailGeneratorService {

    private final WebClient webClient;

    private final EmailThreadRepository emailThreadRepository;
    private final EmailMessageRepository emailMessageRepository;
    private final GeneratedReplyRepository generatedReplyRepository;

    @Value("${gemini.api.url:}")
    private String geminiApiUrl;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    public EmailGeneratorService(
            WebClient.Builder webClientBuilder,
            EmailThreadRepository emailThreadRepository,
            EmailMessageRepository emailMessageRepository,
            GeneratedReplyRepository generatedReplyRepository
    ) {
        this.webClient = webClientBuilder.build();
        this.emailThreadRepository = emailThreadRepository;
        this.emailMessageRepository = emailMessageRepository;
        this.generatedReplyRepository = generatedReplyRepository;
    }

    public String generateEmailReply(EmailRequest emailRequest) {
        if (geminiApiUrl.isBlank() || geminiApiKey.isBlank()) {
            throw new IllegalStateException("GEMINI_API_URL and GEMINI_API_KEY must be set as environment variables");
        }

       
        EmailThread thread = saveThread(emailRequest);

       
        String prompt = buildPrompt(emailRequest);

       
        Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                        Map.of("parts", new Object[]{
                                Map.of("text", prompt)
                        })
                }
        );

        String response = webClient.post()
                .uri(geminiApiUrl + geminiApiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        String replyText = extractResponseContent(response);

        
        saveGeneratedReply(thread, emailRequest.getTone(), replyText);

        
        return replyText;
    }

    private String extractResponseContent(String response) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(response);
            return rootNode.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();
        } catch (Exception e) {
            return "Error processing request: " + e.getMessage();
        }
    }

    

    private EmailThread saveThread(EmailRequest emailRequest) {
        EmailThread thread = new EmailThread();
        thread.setSubject(emailRequest.getSubject());

        
        EmailThread savedThread = emailThreadRepository.save(thread);

        if (emailRequest.getMessages() != null && !emailRequest.getMessages().isEmpty()) {
            for (int i = 0; i < emailRequest.getMessages().size(); i++) {
                EmailMessageDTO dto = emailRequest.getMessages().get(i);

                EmailMessage message = new EmailMessage();
                message.setThread(savedThread);
                message.setPosition(i);
                message.setSender(dto.getSender());
                message.setRecipient(dto.getRecipient());
                message.setBody(dto.getBody());

                emailMessageRepository.save(message);
            }
        } else {
            
            if (emailRequest.getEmailContent() != null && !emailRequest.getEmailContent().isBlank()) {
                EmailMessage message = new EmailMessage();
                message.setThread(savedThread);
                message.setPosition(0);
                message.setSender(null);
                message.setRecipient(null);
                message.setBody(emailRequest.getEmailContent());
                emailMessageRepository.save(message);
            }
        }

        return savedThread;
    }

 

    private void saveGeneratedReply(EmailThread thread, String tone, String replyText) {
        GeneratedReply reply = new GeneratedReply();
        reply.setThread(thread);
        reply.setTone(tone);
        reply.setReplyBody(replyText);
      

        generatedReplyRepository.save(reply);
    }

  

    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt = new StringBuilder();

      
        String tone = emailRequest.getTone();
        String toneInstruction;

        if (tone == null || tone.isBlank()) {
            toneInstruction = """
                    Use a neutral, professional tone.
                    """;
        } else {
            switch (tone.toLowerCase()) {
                case "formal" -> toneInstruction = """
                        Use a formal and professional tone.
                        - Polite and respectful
                        - Full sentences, no slang
                        - Slightly more structured and detailed
                        """;
                case "friendly" -> toneInstruction = """
                        Use a warm, friendly, yet professional tone.
                        - Polite and approachable
                        - You may use light contractions (I'm, we'll)
                        - Keep it positive and conversational
                        """;
                case "concise" -> toneInstruction = """
                        Use a concise professional tone.
                        - Focus on the key points only
                        - Avoid repetition and filler phrases
                        - Aim for a short, clear reply
                        """;
                default -> toneInstruction = """
                        Use a professional tone that matches the context of the thread.
                        """;
            }
        }

        
        prompt.append("""
                You are an assistant that drafts polished email replies on behalf of the user.

                Objectives:
                - Reply to the LAST email in the conversation.
                - Be clear, helpful, and professional.
                - Address all explicit questions and requests in the latest message.
                """).append("\n");

        prompt.append("Tone:\n")
                .append(toneInstruction)
                .append("\n");

        prompt.append("""
                Writing guidelines:
                - Start with an appropriate greeting (e.g., "Hi Alice,").
                - Briefly acknowledge the latest email.
                - Then provide a clear and structured response.
                - If some concrete detail is missing (e.g., a date, file name, link),
                  use a short placeholder like [date], [link], or [file name] dont add date on your own if not sure.
                - Do NOT invent facts, promises, discounts, or dates that are not supported by the thread.
                - Do NOT repeat or quote the entire thread.
                - Do NOT include a subject line.
                - Do NOT include headers like "From:", "To:", or "Subject:" in your reply.
                """).append("\n");

        prompt.append("""
                Think carefully about the conversation before responding.
                Your final output must be only the email body the user will send.
                """).append("\n\n");

        
        if (emailRequest.getSubject() != null && !emailRequest.getSubject().isBlank()) {
            prompt.append("Subject of the email thread: ")
                    .append(emailRequest.getSubject())
                    .append("\n\n");
        }

        
        if (emailRequest.getMessages() != null && !emailRequest.getMessages().isEmpty()) {
            prompt.append("Email thread (oldest first):\n");

            for (int i = 0; i < emailRequest.getMessages().size(); i++) {
                EmailMessageDTO msg = emailRequest.getMessages().get(i);
                prompt.append("---- Message ").append(i + 1).append(" ----\n");

                if (msg.getSender() != null && !msg.getSender().isBlank()) {
                    prompt.append("From: ").append(msg.getSender()).append("\n");
                }
                if (msg.getRecipient() != null && !msg.getRecipient().isBlank()) {
                    prompt.append("To: ").append(msg.getRecipient()).append("\n");
                }

                prompt.append("Body:\n")
                        .append(msg.getBody() == null ? "" : msg.getBody())
                        .append("\n\n");
            }

            prompt.append("""
                    End of thread.

                    Task:
                    Write the reply email body as the recipient of the LAST message in this thread.
                    Output only the email body, nothing else.
                    """);
        } else {
            prompt.append("Original email (single message):\n")
                    .append(emailRequest.getEmailContent() == null ? "" : emailRequest.getEmailContent())
                    .append("\n\n")
                    .append("""
                            Task:
                            Write the reply email body as the recipient of this email.
                            Output only the email body, nothing else.
                            """);
        }

        return prompt.toString();
    }
}
