package com.sguerra.taskmanager.task;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<?> list(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(taskService.getAll(userId));
    }

    @PostMapping
    public ResponseEntity<?> create(Authentication auth, @RequestBody TaskRequest req) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(taskService.create(userId, req.title(), req.description()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(Authentication auth, @PathVariable Long id, @RequestBody TaskRequest req) {
        Long userId = (Long) auth.getPrincipal();
        try {
            return ResponseEntity.ok(taskService.update(userId, id, req.title(), req.description(), req.status()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(Authentication auth, @PathVariable Long id) {
        Long userId = (Long) auth.getPrincipal();
        try {
            taskService.delete(userId, id);
            return ResponseEntity.ok(Map.of("ok", true));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    record TaskRequest(String title, String description, TaskStatus status) {}
}
