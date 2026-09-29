package com.dataintelligence;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class DataIntelligenceApplication {
    public static void main(String[] args) {
        SpringApplication.run(DataIntelligenceApplication.class, args);
    }
}
