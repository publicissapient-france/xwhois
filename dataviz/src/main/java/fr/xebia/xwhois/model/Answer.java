package fr.xebia.xwhois.model;

import lombok.Value;

import java.time.Instant;

@Value
public class Answer {
    String user;
    String guessed;
    boolean success;
    Instant date;
}
