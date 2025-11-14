package com.edge.service;

import com.edge.entity.User;
import com.edge.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class UserService
{
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired(required = false)
    private WebSocketService webSocketService;
    
    public List<User> getAllUsers()
    {
        return userRepository.getAllUsers();
    }
    
    public Optional<User> getUserById(String id)
    {
        return userRepository.getUserById(id);
    }
    
    public Optional<User> getUserByEmail(String email)
    {
        return userRepository.getUserByEmail(email);
    }
    
    public Optional<User> getUserByUserid(String userid)
    {
        return userRepository.getUserByUserid(userid);
    }
    
    public User createUser(User user)
    {
        User created = userRepository.createUser(user);
        if (webSocketService != null) {
            webSocketService.broadcastUserUpdate(created);
        }
        return created;
    }
    
    public User updateUser(String id, User userDetails)
    {
        User updated = userRepository.updateUser(id, userDetails);
        if (webSocketService != null) {
            webSocketService.broadcastUserUpdate(updated);
        }
        return updated;
    }
    
    public void deleteUser(String id)
    {
        userRepository.deleteUser(id);
        if (webSocketService != null) {
            webSocketService.broadcastUserDelete(id);
        }
    }
}
