package com.example.backend.dto.request;

import java.time.LocalDateTime;

public class DeadlineRequest {

    private Integer weekNo;

    private String title;

    private String description;

    private LocalDateTime dueDate;

    private String type;

    private String internshipTermId;

    private String teacherId;

    public DeadlineRequest() {}

    public Integer getWeekNo() {
        return weekNo;
    }

    public void setWeekNo(Integer weekNo) {
        this.weekNo = weekNo;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getInternshipTermId() {
        return internshipTermId;
    }

    public void setInternshipTermId(String internshipTermId) {
        this.internshipTermId = internshipTermId;
    }

    public String getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(String teacherId) {
        this.teacherId = teacherId;
    }
}