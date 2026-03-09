package com.sguerra.taskmanager.task;

import com.sguerra.taskmanager.user.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository tasks;
    private final UserRepository users;

    public TaskService(TaskRepository tasks, UserRepository users) {
        this.tasks = tasks;
        this.users = users;
    }

    public List<Task> getAll(Long userId) {
        return tasks.findByUserId(userId);
    }

    public Task create(Long userId, String title, String description) {
        var user = users.findById(userId).orElseThrow();
        var task = new Task();
        task.setTitle(title);
        task.setDescription(description);
        task.setUser(user);
        return tasks.save(task);
    }

    public Task update(Long userId, Long taskId, String title, String description, TaskStatus status) {
        var task = tasks.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Tarea no encontrada"));
        if (title != null) task.setTitle(title);
        if (description != null) task.setDescription(description);
        if (status != null) task.setStatus(status);
        return tasks.save(task);
    }

    public void delete(Long userId, Long taskId) {
        var task = tasks.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Tarea no encontrada"));
        tasks.delete(task);
    }
}
