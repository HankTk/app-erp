package com.edge.controller;

/**
 * @author Hidenori Takaku
 */
import com.edge.entity.User;
import com.edge.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Component
@RestController
@RequestMapping("/api/users")
public class UserController
{

    @Autowired
    private UserService userService;

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public List<User> getAllUsers()
    {
        return userService.getAllUsers();
    }

    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<User> getUserById(@PathVariable String id)
    {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/email/{email}", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email)
    {
        return userService.getUserByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/userid/{userid}", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<User> getUserByUserid(@PathVariable String userid)
    {
        return userService.getUserByUserid(userid)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<User> login(@RequestBody LoginRequest loginRequest)
    {
        System.out.println("Login attempt - userid: " + loginRequest.getUserid() + ", password: " + (loginRequest.getPassword() != null ? "***" : "null"));
        
        if (loginRequest.getUserid() == null || loginRequest.getUserid().trim().isEmpty()) {
            System.out.println("Login failed: userid is null or empty");
            return ResponseEntity.status(401).build();
        }
        
        Optional<User> userOpt = userService.getUserByUserid(loginRequest.getUserid());
        if (userOpt.isEmpty()) {
            System.out.println("Login failed: user not found");
            return ResponseEntity.status(401).build();
        }
        
        User user = userOpt.get();
        System.out.println("User found: " + user.getUserid());
        boolean passwordMatches = loginRequest.getPassword() != null && loginRequest.getPassword().equals(user.getPassword());
        System.out.println("Password matches: " + passwordMatches);
        
        if (passwordMatches) {
            // Don't return password in response
            user.setPassword(null);
            System.out.println("Login successful for user: " + user.getUserid());
            return ResponseEntity.ok(user);
        } else {
            System.out.println("Login failed: password mismatch");
            return ResponseEntity.status(401).build();
        }
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public User createUser(@RequestBody User user)
    {
        return userService.createUser(user);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<User> updateUser(@PathVariable String id, @RequestBody User userDetails)
    {
        System.out.println("Received PUT request for user ID: " + id);
        System.out.println("Request body: " + userDetails);
        try
        {
            User updatedUser = userService.updateUser(id, userDetails);
            System.out.println("User updated successfully");
            return ResponseEntity.ok(updatedUser);
        }
        catch (RuntimeException e)
        {
            System.err.println("Update error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id)
    {
        try
        {
            userService.deleteUser(id);
            return ResponseEntity.ok().build();
        }
        catch (RuntimeException e)
        {
            e.printStackTrace();
            System.err.println("Delete error: " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

}
