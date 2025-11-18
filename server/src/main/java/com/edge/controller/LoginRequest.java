package com.edge.controller;

/**
 * @author Hidenori Takaku
 */
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    private String userid;
    private String password;
}

