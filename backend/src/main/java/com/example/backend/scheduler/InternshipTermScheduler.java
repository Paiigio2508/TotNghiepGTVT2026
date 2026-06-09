package com.example.backend.scheduler;

import com.example.backend.entity.InternshipTerm;
import com.example.backend.repository.InternshipTermRepository;
import com.example.backend.util.status.TermStatus;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class InternshipTermScheduler {

    private final InternshipTermRepository repository;

    @PostConstruct
    public void init() {
        updateTermStatus();
    }

    /**
     * Chạy mỗi ngày lúc 00:00 theo giờ Việt Nam.
     */
//    @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Ho_Chi_Minh")
    @Scheduled(cron = "0 * * * * *", zone = "Asia/Ho_Chi_Minh")
    @Transactional
    public void updateTermStatus() {
        System.out.println("=== InternshipTermScheduler running ===");

        LocalDate today = LocalDate.now();

        List<InternshipTerm> terms = repository.findAll();

        for (InternshipTerm term : terms) {

            if (term.getStartDate() == null || term.getEndDate() == null) {
                continue;
            }

            TermStatus newStatus;

            if (today.isBefore(term.getStartDate())) {
                newStatus = TermStatus.SAP_DIEN_RA;
            } else if (!today.isAfter(term.getEndDate())) {
                newStatus = TermStatus.DANG_DIEN_RA;
            } else {
                newStatus = TermStatus.KET_THUC;
            }

            if (term.getStatus() != newStatus) {
                term.setStatus(newStatus);
                repository.save(term);

                System.out.println(
                        "Updated term " + term.getName() + " to " + newStatus
                );
            }
        }
    }
}