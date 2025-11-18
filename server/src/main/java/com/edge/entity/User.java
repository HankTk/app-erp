package com.edge.entity;

/**
 * @author Hidenori Takaku
 */
import lombok.Data;
import java.util.Map;

@Data
public class User {

    private String id;
    private String userid;
    private String password;
    private String role;
    private String firstName;
    private String lastName;
    private String email;
    private Map<String, Object> jsonData;

    // Method to get the full name
    public String getFullName() {
        return lastName + " " + firstName;
    }
}
