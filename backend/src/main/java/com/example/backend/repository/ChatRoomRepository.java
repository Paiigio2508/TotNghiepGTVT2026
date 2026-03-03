package com.example.backend.repository;

import com.example.backend.dto.response.ChatRoomProjection;
import com.example.backend.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, String> {
    Optional<ChatRoom> findByAdvisorAssignment_Student_Id(String studentId);

    @Query(value = """
                    SELECT
                        cr.id AS roomId,
                        s.full_name AS studentName,
                        u.url_image AS avatar,
                         s.student_code AS studentCode
                    FROM chat_rooms cr
                    JOIN advisor_assignments aa
            ON cr.advisor_assignment_id = aa.id
            JOIN students s
            ON aa.student_id = s.id
            JOIN users u
            ON s.user_id = u.id
            WHERE aa.teacher_id= :teacherId
                    """, nativeQuery = true)
    List<ChatRoomProjection> findRoomsByTeacherId(@Param("teacherId") String teacherId);

    List<ChatRoom> findByAdvisorAssignment_Teacher_Id(String teacherId);
}
