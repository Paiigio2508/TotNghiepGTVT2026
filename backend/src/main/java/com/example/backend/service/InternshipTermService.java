package com.example.backend.service;

import com.example.backend.dto.response.InternshipTermResponse;
import com.example.backend.repository.InternshipTermRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InternshipTermService {
    private final InternshipTermRepository internshipTermRepository;

    public List<InternshipTermResponse> getALL() {
        return internshipTermRepository.getALL();
    }
}
