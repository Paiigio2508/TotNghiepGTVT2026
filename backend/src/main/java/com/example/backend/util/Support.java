package com.example.backend.util;

import org.apache.poi.ss.usermodel.Row;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
@Component
public class Support {
    public String generatePassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder password = new StringBuilder();
        SecureRandom random = new SecureRandom();

        for (int i = 0; i < 6; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }

        return password.toString();
    }
    public String getCellValue(Row row, int index) {
        if (row.getCell(index) == null) {
            return "";
        }

        return row.getCell(index).toString().trim();
    }
}
