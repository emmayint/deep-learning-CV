-- MySQL dump 10.13  Distrib 8.0.18, for macos10.14 (x86_64)
--
-- Host:     Database: csc899
-- ------------------------------------------------------
-- Server version	5.7.26-log

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
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '';

--
-- Table structure for table `Models`
--

DROP TABLE IF EXISTS `Models`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Models` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `project_name` varchar(100) DEFAULT NULL,
  `project_path` varchar(1000) DEFAULT NULL,
  `model_fullname` varchar(100) DEFAULT NULL,
  `classes` varchar(100) DEFAULT NULL,
  `inv_label_map` varchar(100) DEFAULT NULL,
  `model_path` varchar(1000) DEFAULT NULL,
  `log_path` varchar(1000) DEFAULT NULL,
  `selected_model` varchar(100) DEFAULT NULL,
  `epoch` int(11) DEFAULT NULL,
  `optimizer` varchar(100) DEFAULT NULL,
  `learning_rate` varchar(10) DEFAULT NULL,
  `timestamp` varchar(100) DEFAULT NULL,
  `train_size` int(11) DEFAULT NULL,
  `train_batch_size` int(11) DEFAULT NULL,
  `test_accuracy` varchar(100) DEFAULT NULL,
  `test_loss` varchar(100) DEFAULT NULL,
  `cm` varchar(100) DEFAULT NULL,
  `imgs01` varchar(2000) DEFAULT NULL,
  `imgs10` varchar(2000) DEFAULT NULL,
  `imgs02` varchar(1000) DEFAULT NULL,
  `imgs12` varchar(1000) DEFAULT NULL,
  `imgs20` varchar(1000) DEFAULT NULL,
  `imgs21` varchar(1000) DEFAULT NULL,
  `favorite` tinyint(1) DEFAULT NULL,
  `exp_id` int(5) DEFAULT NULL,
  `isPublic` tinyint(1) DEFAULT '0',
  `userNotes` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `model_fullname_UNIQUE` (`model_fullname`),
  KEY `models_FK` (`exp_id`),
  CONSTRAINT `models_FK` FOREIGN KEY (`exp_id`) REFERENCES `experiments` (`exp_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `experiment_cropped_images`
--

DROP TABLE IF EXISTS `experiment_cropped_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `experiment_cropped_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exp_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `exp_img_id` int(11) NOT NULL,
  `exp_crop_img` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `exp_label_name` varchar(255) NOT NULL,
  `rect` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `experiment_images`
--

DROP TABLE IF EXISTS `experiment_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `experiment_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exp_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `exp_images` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `rect` text CHARACTER SET latin1,
  `channel` varchar(255) DEFAULT '',
  `exp_type` varchar(45) DEFAULT NULL,
  `img_dir` varchar(450) DEFAULT NULL,
  `label` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `exp_id` (`exp_id`),
  KEY `experiment_images_ibfk_2_idx` (`user_id`),
  CONSTRAINT `experiment_images_ibfk_1` FOREIGN KEY (`exp_id`) REFERENCES `experiments` (`exp_id`),
  CONSTRAINT `experiment_images_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `experiments`
--

DROP TABLE IF EXISTS `experiments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `experiments` (
  `exp_id` int(11) NOT NULL AUTO_INCREMENT,
  `users_id` int(11) NOT NULL,
  `exp_title` varchar(500) NOT NULL DEFAULT '',
  `exp_birth_date` date NOT NULL,
  `exp_misc_data` json DEFAULT NULL,
  `exp_type` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`exp_id`),
  KEY `users_id` (`users_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prediction`
--

DROP TABLE IF EXISTS `prediction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prediction` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `exp_id` int(11) NOT NULL,
  `exp_img_id` int(11) NOT NULL,
  `crop_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `img` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `exp_type` varchar(225) NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `validateResult` tinyint(4) DEFAULT NULL,
  `training_algo` varchar(450) DEFAULT NULL,
  `model_name` varchar(450) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pred_FK1` (`exp_id`),
  KEY `pred_FK2_idx` (`exp_img_id`),
  CONSTRAINT `pred_FK1` FOREIGN KEY (`exp_id`) REFERENCES `experiments` (`exp_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `pred_FK2` FOREIGN KEY (`exp_img_id`) REFERENCES `experiment_images` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prediction_type`
--

DROP TABLE IF EXISTS `prediction_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prediction_type` (
  `id` int(50) NOT NULL AUTO_INCREMENT,
  `exp_id` int(50) NOT NULL,
  `exp_img_id` int(50) NOT NULL,
  `img` varchar(50) NOT NULL,
  `exp_type` varchar(100) NOT NULL,
  `created_at` datetime NOT NULL,
  `update_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_validate` varchar(45) DEFAULT NULL,
  `exp_validate` tinyint(4) NOT NULL DEFAULT '0',
  `pred_percentage` json DEFAULT NULL,
  `training_algo` varchar(450) DEFAULT NULL,
  `model_name` varchar(450) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pred_type_FK1` (`exp_id`),
  KEY `pred_type_FK2_idx` (`exp_img_id`),
  CONSTRAINT `pred_type_FK1` FOREIGN KEY (`exp_id`) REFERENCES `experiments` (`exp_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `pred_type_FK2` FOREIGN KEY (`exp_img_id`) REFERENCES `experiment_images` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` text CHARACTER SET utf8 COLLATE utf8_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-04-17 21:02:44
