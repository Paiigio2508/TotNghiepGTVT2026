-- MySQL dump 10.13  Distrib 8.0.29, for Win64 (x86_64)
--
-- Host: localhost    Database: doantotnghiepgtvt2026
-- ------------------------------------------------------
-- Server version	8.0.29

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `advisor_assignments`
--

DROP TABLE IF EXISTS `advisor_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `advisor_assignments` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `assigned_date` date NOT NULL,
  `matched_specialization_snapshot` varchar(255) DEFAULT NULL,
  `result` enum('DANG_THUC_TAP','DAT','KHONG_DAT') NOT NULL,
  `student_specialization_snapshot` varchar(255) DEFAULT NULL,
  `teacher_specialization_snapshot` varchar(255) DEFAULT NULL,
  `specialization_id` varchar(36) DEFAULT NULL,
  `student_id` char(36) NOT NULL,
  `teacher_id` char(36) NOT NULL,
  `term_id` varchar(36) NOT NULL,
  `topic_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK50etnk36tuhbooh7p8113a8x3` (`student_id`,`term_id`),
  UNIQUE KEY `UK_71f1m7cljl9ir1ffekh41djwt` (`topic_id`),
  KEY `FKdx7j8urauuj6sy7jwy1wiq53r` (`specialization_id`),
  KEY `FK19c5ssm0nk8b9q9dpeof3w7q6` (`teacher_id`),
  KEY `FKcyvwve4m9fu0oe8ikdledixe8` (`term_id`),
  CONSTRAINT `FK19c5ssm0nk8b9q9dpeof3w7q6` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`),
  CONSTRAINT `FKcyvwve4m9fu0oe8ikdledixe8` FOREIGN KEY (`term_id`) REFERENCES `internship_terms` (`id`),
  CONSTRAINT `FKdx7j8urauuj6sy7jwy1wiq53r` FOREIGN KEY (`specialization_id`) REFERENCES `specialization` (`id`),
  CONSTRAINT `FKq5cn8us10ci7qlldrekjmiwi` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `FKrqcw3snv27xm2do9suo3hbc0p` FOREIGN KEY (`topic_id`) REFERENCES `topics` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `advisor_assignments`
--

LOCK TABLES `advisor_assignments` WRITE;
/*!40000 ALTER TABLE `advisor_assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `advisor_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_messages`
--

DROP TABLE IF EXISTS `chat_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_messages` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_url` varchar(255) DEFAULT NULL,
  `is_read` bit(1) DEFAULT NULL,
  `message` text,
  `message_type` enum('IMAGE','TEXT','FILE') DEFAULT NULL,
  `chat_room_id` varchar(36) NOT NULL,
  `sender_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKbcsxusjp1v4rd8879fhvq8ssb` (`chat_room_id`),
  KEY `FKgiqeap8ays4lf684x7m0r2729` (`sender_id`),
  CONSTRAINT `FKbcsxusjp1v4rd8879fhvq8ssb` FOREIGN KEY (`chat_room_id`) REFERENCES `chat_rooms` (`id`),
  CONSTRAINT `FKgiqeap8ays4lf684x7m0r2729` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_messages`
--

LOCK TABLES `chat_messages` WRITE;
/*!40000 ALTER TABLE `chat_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_rooms`
--

DROP TABLE IF EXISTS `chat_rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_rooms` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `advisor_assignment_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_kav1hbam9d2v339hrpt87aw4u` (`advisor_assignment_id`),
  CONSTRAINT `FK6gyx6frg52bmu5imi99yc219a` FOREIGN KEY (`advisor_assignment_id`) REFERENCES `advisor_assignments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_rooms`
--

LOCK TABLES `chat_rooms` WRITE;
/*!40000 ALTER TABLE `chat_rooms` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deadlines`
--

DROP TABLE IF EXISTS `deadlines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deadlines` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `due_date` datetime(6) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `type` enum('REPORT','ANNOUNCEMENT') DEFAULT NULL,
  `week_no` int DEFAULT NULL,
  `internship_term_id` varchar(36) DEFAULT NULL,
  `teacher_id` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKe07m9spj6vq23q1en6gqbxlfn` (`internship_term_id`),
  KEY `FKf753hxtvixnun6iil3ms565ov` (`teacher_id`),
  CONSTRAINT `FKe07m9spj6vq23q1en6gqbxlfn` FOREIGN KEY (`internship_term_id`) REFERENCES `internship_terms` (`id`),
  CONSTRAINT `FKf753hxtvixnun6iil3ms565ov` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deadlines`
--

LOCK TABLES `deadlines` WRITE;
/*!40000 ALTER TABLE `deadlines` DISABLE KEYS */;
/*!40000 ALTER TABLE `deadlines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `final_reports`
--

DROP TABLE IF EXISTS `final_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `final_reports` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `comment` text,
  `file_url` varchar(1000) DEFAULT NULL,
  `submit_date` datetime(6) DEFAULT NULL,
  `advisor_assignment_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKepdujueuei56o1lnc2b1gcqyr` (`advisor_assignment_id`),
  CONSTRAINT `FKepdujueuei56o1lnc2b1gcqyr` FOREIGN KEY (`advisor_assignment_id`) REFERENCES `advisor_assignments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `final_reports`
--

LOCK TABLES `final_reports` WRITE;
/*!40000 ALTER TABLE `final_reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `final_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `internship_terms`
--

DROP TABLE IF EXISTS `internship_terms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `internship_terms` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `academic_year` varchar(255) DEFAULT NULL,
  `description` text,
  `end_date` date DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `registration_deadline` date DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `status` enum('SAP_DIEN_RA','DANG_DIEN_RA','KET_THUC') DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `internship_terms`
--

LOCK TABLES `internship_terms` WRITE;
/*!40000 ALTER TABLE `internship_terms` DISABLE KEYS */;
INSERT INTO `internship_terms` VALUES ('4376ff1c-cbe1-457a-b7a8-4c1e1cfc018c','2026-04-22 08:57:25.251571',NULL,'2025-2026','á','2026-06-01','Học kì 1 ','2026-02-01','2026-01-01','DANG_DIEN_RA'),('5a9ba803-18ff-4be1-afda-823476734d9a','2026-04-22 09:00:20.792007',NULL,'2025-2026','ád','2026-12-01','Học kì 2 ','2026-07-01','2026-06-01','SAP_DIEN_RA');
/*!40000 ALTER TABLE `internship_terms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `content` text,
  `entity_id` varchar(255) DEFAULT NULL,
  `is_read` bit(1) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `type` enum('DEADLINE_CREATED','TOPIC_REGISTERED_SUCCESS','TOPIC_APPROVED_BY_TEACHER','TOPIC_APPROVED_BY_ADMIN','WEEKLY_REPORT_DUE_SOON','WEEKLY_REPORT_GRADED','FINAL_REPORT_GRADED') DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK9y21adhxn0ayjhfocscqox7bh` (`user_id`),
  CONSTRAINT `FK9y21adhxn0ayjhfocscqox7bh` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scores`
--

DROP TABLE IF EXISTS `scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scores` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `note` text,
  `score` double DEFAULT NULL,
  `weekly_report_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_3ss7y9wfftboho0aasoceclvk` (`weekly_report_id`),
  CONSTRAINT `FKei8g2mqv319cst4xqqx4a8gqi` FOREIGN KEY (`weekly_report_id`) REFERENCES `weekly_reports` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scores`
--

LOCK TABLES `scores` WRITE;
/*!40000 ALTER TABLE `scores` DISABLE KEYS */;
/*!40000 ALTER TABLE `scores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `specialization`
--

DROP TABLE IF EXISTS `specialization`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `specialization` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `status` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `specialization`
--

LOCK TABLES `specialization` WRITE;
/*!40000 ALTER TABLE `specialization` DISABLE KEYS */;
INSERT INTO `specialization` VALUES ('7e233e04-82c3-4e94-a72a-26f77d247772','2026-04-22 09:01:42.830822',NULL,NULL,'trí tuệ nhân tạo',0),('7f863439-087d-4b30-ac63-8f3f72ac4b4a','2026-04-22 09:01:04.021009',NULL,NULL,'lập trình web',0),('a3e88b84-6694-4f52-ae1a-2aaa0f350333','2026-04-22 09:01:25.663437',NULL,NULL,'khoa học dữ liệu',0),('b22c43c0-1b55-4b6a-a7e8-1ca553f590e7','2026-04-22 09:01:34.895921',NULL,NULL,'kiểm thử phần mềm',0);
/*!40000 ALTER TABLE `specialization` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` char(36) NOT NULL,
  `class_name` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `major` varchar(255) DEFAULT NULL,
  `status` enum('DU_DIEU_KIEN','KHONG_DU_DIEU_KIEN') DEFAULT NULL,
  `student_code` varchar(255) DEFAULT NULL,
  `specialization_id` varchar(36) DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_cgcf3r5xk73o0etbduc1qxnol` (`student_code`),
  UNIQUE KEY `UK_g4fwvutq09fjdlb4bb0byp7t` (`user_id`),
  KEY `FKg0672vsit42f0afh04et2g17` (`specialization_id`),
  CONSTRAINT `FKdt1cjx5ve5bdabmuuf3ibrwaq` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKg0672vsit42f0afh04et2g17` FOREIGN KEY (`specialization_id`) REFERENCES `specialization` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES ('09f50b74-a03c-4f4c-9cd7-5fc0cb075c79','K28.2','Nguyễn Thị Phương Anh','CNTT','DU_DIEU_KIEN','5240285','7f863439-087d-4b30-ac63-8f3f72ac4b4a','a200bccd-26e2-4341-9927-bf215828a3c7'),('24dd86c1-fbe0-4476-84c4-9e9898913361','K28.2','Phạm Quang Anh','CNTT','DU_DIEU_KIEN','5240286',NULL,'06d286a8-c17b-4781-aca3-2817a8ec1fad'),('538a24b6-d5eb-4d0e-bcb0-e70e8387dfdc','K28.2','Nguyễn Tùng Dương','CNTT','DU_DIEU_KIEN','5240294','7f863439-087d-4b30-ac63-8f3f72ac4b4a','ff4bfa12-2623-439e-b7b9-806398cfff7b'),('6658de4f-319c-4a02-9fdf-6921a331c1ab','K28.1','Hà Văn Thịnh','CNTT','DU_DIEU_KIEN','5100000','b22c43c0-1b55-4b6a-a7e8-1ca553f590e7','3772022c-6344-47ca-96ad-e5ae750212d3'),('e0ed9d29-9848-4660-a7a8-ad1eff86a01d','K28.2','Nguyễn Văn Tú','CNTT','KHONG_DU_DIEU_KIEN','5555555','7e233e04-82c3-4e94-a72a-26f77d247772','684b2659-7f19-4cf8-953d-2c9810c355c3');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacher_specialization_history`
--

DROP TABLE IF EXISTS `teacher_specialization_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teacher_specialization_history` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `new_value` text,
  `note` varchar(500) DEFAULT NULL,
  `old_value` text,
  `teacher_id` char(36) NOT NULL,
  `term_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKko74vmesmhxbsrdeqt87q8s8d` (`teacher_id`),
  KEY `FK1256dvjt2qb2a0xareq67xl2` (`term_id`),
  CONSTRAINT `FK1256dvjt2qb2a0xareq67xl2` FOREIGN KEY (`term_id`) REFERENCES `internship_terms` (`id`),
  CONSTRAINT `FKko74vmesmhxbsrdeqt87q8s8d` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher_specialization_history`
--

LOCK TABLES `teacher_specialization_history` WRITE;
/*!40000 ALTER TABLE `teacher_specialization_history` DISABLE KEYS */;
INSERT INTO `teacher_specialization_history` VALUES ('2e57d614-3f04-41c7-bcc3-f0e1cafbe0ee','2026-04-22 09:48:45.498257',NULL,'kiểm thử phần mềm','Cập nhật phân công chuyên môn theo kỳ','','d07cec26-2b70-44fa-88e6-6e361b837a1f','4376ff1c-cbe1-457a-b7a8-4c1e1cfc018c'),('9cce48dc-1a1d-477d-aafc-0d57f68adbce','2026-04-22 10:42:13.528949',NULL,'kiểm thử phần mềm, lập trình web','Cập nhật phân công chuyên môn theo kỳ','kiểm thử phần mềm','d07cec26-2b70-44fa-88e6-6e361b837a1f','4376ff1c-cbe1-457a-b7a8-4c1e1cfc018c'),('f06ff931-a2a2-4dfb-96f6-3702c629aef3','2026-04-22 09:48:45.465733',NULL,'lập trình web','Cập nhật phân công chuyên môn theo kỳ','','20b891c5-8320-4a5c-a1db-1e8bd3f7d47a','4376ff1c-cbe1-457a-b7a8-4c1e1cfc018c');
/*!40000 ALTER TABLE `teacher_specialization_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacher_specialization_term`
--

DROP TABLE IF EXISTS `teacher_specialization_term`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teacher_specialization_term` (
  `id` varchar(36) NOT NULL,
  `assigned_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `assigned_by` varchar(36) DEFAULT NULL,
  `specialization_id` varchar(36) NOT NULL,
  `teacher_id` char(36) NOT NULL,
  `term_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_teacher_specialization_term` (`teacher_id`,`specialization_id`,`term_id`),
  KEY `FKd6eii8nu42ga1rb0dj9ywjoi2` (`assigned_by`),
  KEY `FKgky86krv1qvjn08gu5ardawgx` (`specialization_id`),
  KEY `FKl3fin4rna5mnqf4yqoj7kvwjw` (`term_id`),
  CONSTRAINT `FKd6eii8nu42ga1rb0dj9ywjoi2` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKgky86krv1qvjn08gu5ardawgx` FOREIGN KEY (`specialization_id`) REFERENCES `specialization` (`id`),
  CONSTRAINT `FKl3fin4rna5mnqf4yqoj7kvwjw` FOREIGN KEY (`term_id`) REFERENCES `internship_terms` (`id`),
  CONSTRAINT `FKrmnlhq1er1gnqxsus111btv5r` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher_specialization_term`
--

LOCK TABLES `teacher_specialization_term` WRITE;
/*!40000 ALTER TABLE `teacher_specialization_term` DISABLE KEYS */;
INSERT INTO `teacher_specialization_term` VALUES ('8e949a93-8693-459f-b6ad-66b81f0064e1','2026-04-22 10:42:13.550930','2026-04-22 10:42:13.550930',NULL,'b22c43c0-1b55-4b6a-a7e8-1ca553f590e7','d07cec26-2b70-44fa-88e6-6e361b837a1f','4376ff1c-cbe1-457a-b7a8-4c1e1cfc018c'),('dfda0261-0ed2-43aa-9dbc-ae47d166516e','2026-04-22 09:48:45.483426','2026-04-22 09:48:45.483426',NULL,'7f863439-087d-4b30-ac63-8f3f72ac4b4a','20b891c5-8320-4a5c-a1db-1e8bd3f7d47a','4376ff1c-cbe1-457a-b7a8-4c1e1cfc018c'),('e2d4fe58-ef18-45be-acf7-6be0791a4fd8','2026-04-22 10:42:13.550930','2026-04-22 10:42:13.550930',NULL,'7f863439-087d-4b30-ac63-8f3f72ac4b4a','d07cec26-2b70-44fa-88e6-6e361b837a1f','4376ff1c-cbe1-457a-b7a8-4c1e1cfc018c');
/*!40000 ALTER TABLE `teacher_specialization_term` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teachers`
--

DROP TABLE IF EXISTS `teachers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teachers` (
  `id` char(36) NOT NULL,
  `department` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `status` int DEFAULT NULL,
  `teacher_code` varchar(255) DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_98e7j8mw41re3p2mis5rr9608` (`teacher_code`),
  UNIQUE KEY `UK_cd1k6xwg9jqtiwx9ybnxpmoh9` (`user_id`),
  CONSTRAINT `FKb8dct7w2j1vl1r2bpstw5isc0` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teachers`
--

LOCK TABLES `teachers` WRITE;
/*!40000 ALTER TABLE `teachers` DISABLE KEYS */;
INSERT INTO `teachers` VALUES ('20b891c5-8320-4a5c-a1db-1e8bd3f7d47a',NULL,'Nguyễn Tiến Hiệp',0,'gv','d73fe40a-0552-4005-8996-bb6b120d9208'),('d07cec26-2b70-44fa-88e6-6e361b837a1f',NULL,'Nguyễn Đình Dương',0,'gv1','f320a014-1503-45fd-8115-75f0649b4261');
/*!40000 ALTER TABLE `teachers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `topics`
--

DROP TABLE IF EXISTS `topics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `topics` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `description` text,
  `status` enum('PENDING','APPROVED_BY_TEACHER','REJECTED_BY_TEACHER','APPROVED_BY_ADMIN','CANCELLED_BY_STUDENT') DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `student_id` char(36) NOT NULL,
  `term_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKd3wdl3eiudornk2qsxahljuo4` (`student_id`),
  KEY `FKrkbjtp4lvbduibvxhtdiihj6e` (`term_id`),
  CONSTRAINT `FKd3wdl3eiudornk2qsxahljuo4` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `FKrkbjtp4lvbduibvxhtdiihj6e` FOREIGN KEY (`term_id`) REFERENCES `internship_terms` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `topics`
--

LOCK TABLES `topics` WRITE;
/*!40000 ALTER TABLE `topics` DISABLE KEYS */;
/*!40000 ALTER TABLE `topics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `ngay_sinh` date DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `role` enum('ADMIN','STUDENT','TEACHER','HEAD_OF_DEPARTMENT') DEFAULT NULL,
  `url_image` varchar(1000) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_6dotkott2kjsp8vw4d0m25fb7` (`email`),
  UNIQUE KEY `UK_du5v5sr43g5bfnji4vb8hg5s3` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('06d286a8-c17b-4781-aca3-2817a8ec1fad','2026-04-22 09:34:13.640644',NULL,'anhpq@gmail.com','Nam','2003-01-01','$2a$10$9CXcLxrZlFOu8Jz8crDEAuJewdeRQOhNVhsfckUB7hlro7M9OAdfe','0123456780','STUDENT',NULL,'sv4'),('3772022c-6344-47ca-96ad-e5ae750212d3','2026-04-22 09:34:48.742265',NULL,'thinh@gmail.com','Nam','1997-01-01','$2a$10$9CXcLxrZlFOu8Jz8crDEAuJewdeRQOhNVhsfckUB7hlro7M9OAdfe','0123456666','STUDENT',NULL,'sv3'),('684b2659-7f19-4cf8-953d-2c9810c355c3','2026-04-22 09:35:14.082739','2026-04-22 09:35:17.389262','bindzvl1922297@gmail.com','Nữ','2026-04-08','$2a$10$9CXcLxrZlFOu8Jz8crDEAuJewdeRQOhNVhsfckUB7hlro7M9OAdfe','0922222222','STUDENT',NULL,'sv2'),('77cc33f1-ab9a-4d18-ad40-fac8603beb33',NULL,NULL,'admin','Nam','1997-08-25','$2a$10$9CXcLxrZlFOu8Jz8crDEAuJewdeRQOhNVhsfckUB7hlro7M9OAdfe','0988353709','ADMIN',NULL,'admin'),('a200bccd-26e2-4341-9927-bf215828a3c7','2026-04-22 09:22:22.336471',NULL,'phanh@gmail.com','Nữ','2003-09-02','$2a$10$9CXcLxrZlFOu8Jz8crDEAuJewdeRQOhNVhsfckUB7hlro7M9OAdfe','0348055118','STUDENT','https://res.cloudinary.com/dm0w2qws8/image/upload/v1776824506/pcoffe/jbokjyylruvyp4xv0cqd.jpg','sv1'),('d73fe40a-0552-4005-8996-bb6b120d9208','2026-04-22 09:23:03.379176',NULL,'bindzvl1997@gmail.com','Nam','2026-04-13','$2a$10$9CXcLxrZlFOu8Jz8crDEAuJewdeRQOhNVhsfckUB7hlro7M9OAdfe','0906986868','HEAD_OF_DEPARTMENT','https://res.cloudinary.com/dm0w2qws8/image/upload/v1776824558/pcoffe/osaaukcntjinhtp5q229.jpg','tbm'),('f320a014-1503-45fd-8115-75f0649b4261','2026-04-22 09:23:33.664117',NULL,'bindzvl1997222@gmail.com','Nam','2019-05-13','$2a$10$9CXcLxrZlFOu8Jz8crDEAuJewdeRQOhNVhsfckUB7hlro7M9OAdfe','0906986222','TEACHER','https://res.cloudinary.com/dm0w2qws8/image/upload/v1776824589/pcoffe/uar0ayeqvtwv2qm6i8je.png','gv'),('ff4bfa12-2623-439e-b7b9-806398cfff7b','2026-04-22 09:02:52.463209',NULL,'duongnt2508@gmail.com','Nam','1997-08-25','$2a$10$9CXcLxrZlFOu8Jz8crDEAuJewdeRQOhNVhsfckUB7hlro7M9OAdfe','0988353700','STUDENT','https://res.cloudinary.com/dm0w2qws8/image/upload/v1776823330/pcoffe/pq4cqij3nygzeyoa5wnc.jpg','sv');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `weekly_reports`
--

DROP TABLE IF EXISTS `weekly_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `weekly_reports` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `comment` text,
  `file_url` varchar(1000) NOT NULL,
  `original_file_name` varchar(255) NOT NULL,
  `score` double DEFAULT NULL,
  `status` enum('NOT_SUBMITTED','SUBMITTED','LATE','GRADED','REJECTED') NOT NULL,
  `submit_date` datetime(6) DEFAULT NULL,
  `week_no` int DEFAULT NULL,
  `advisor_assignment_id` varchar(36) NOT NULL,
  `deadline_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKktwbq8irhv1dq66hin2kwwk2h` (`advisor_assignment_id`,`deadline_id`),
  KEY `FKravuiy7rpgyaik42bjk7vx8qa` (`deadline_id`),
  CONSTRAINT `FKe8gjwdnj3ex1lm25xjaxr5ix7` FOREIGN KEY (`advisor_assignment_id`) REFERENCES `advisor_assignments` (`id`),
  CONSTRAINT `FKravuiy7rpgyaik42bjk7vx8qa` FOREIGN KEY (`deadline_id`) REFERENCES `deadlines` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `weekly_reports`
--

LOCK TABLES `weekly_reports` WRITE;
/*!40000 ALTER TABLE `weekly_reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `weekly_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'doantotnghiepgtvt2026'
--

--
-- Dumping routines for database 'doantotnghiepgtvt2026'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-22 13:58:51
