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
) ENGINE=MyISAM AUTO_INCREMENT=135 DEFAULT CHARSET=latin1;


CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;


-- CREATE TABLE `experiments` (
--   `exp_id` int(11) NOT NULL AUTO_INCREMENT,
--   `users_id` int(11) NOT NULL,
--   `exp_title` varchar(40) NOT NULL DEFAULT '',
--   `exp_birth_date` date NOT NULL,
--   `exp_misc_data` json DEFAULT NULL,
--   PRIMARY KEY (`exp_id`),
--   KEY `users_id` (`users_id`),
--   CONSTRAINT `experiments_ibfk_1` FOREIGN KEY (`users_id`) REFERENCES `users` (`id`)
-- ) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8;


-- CREATE TABLE `experiment_images` (
--   `id` int(11) NOT NULL AUTO_INCREMENT,
--   `exp_id` int(11) NOT NULL,
--   `user_id` int(11) NOT NULL,
--   `exp_images` varchar(255) NOT NULL,
--   `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   `update_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--   `rect` text CHARACTER SET latin1,
--   `channel` varchar(255) DEFAULT '',
--   PRIMARY KEY (`id`),
--   KEY `exp_id` (`exp_id`),
--   KEY `user_id` (`user_id`),
--   CONSTRAINT `experiment_images_ibfk_1` FOREIGN KEY (`exp_id`) REFERENCES `experiments` (`exp_id`),
--   CONSTRAINT `experiment_images_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `experiments` (`users_id`)
-- ) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=utf8;


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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=322 DEFAULT CHARSET=utf8;


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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=188 DEFAULT CHARSET=utf8;


CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` text CHARACTER SET utf8 COLLATE utf8_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `Models` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `model_path` varchar(1000), 
    `user_id` int(11), 
    `project_name` varchar(100),
    `classes_file` varchar(1000), 
    `classes` varchar(100),
    `log_path` varchar(1000), 
    `epoch` int(11),
    `selected_model` varchar(100),
    `optimizer` varchar(100),
    `learning_rate` varchar(10),
    `test_accuracy` varchar(100),
    `test_loss` varchar(100),
    `timestamp` varchar(100),
    `train_batch_size` int(11),
    `model_fullname` varchar(1000),
    `favorite` boolean, 
    
    PRIMARY KEY (`id`)
)

Models, CREATE TABLE `Models` (
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
  `exp_id` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci


CREATE TABLE `experiment_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exp_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `exp_images` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `rect` text CHARACTER SET latin1 COLLATE latin1_swedish_ci,
  `channel` varchar(255) DEFAULT '',
  `label` varchar(45) DEFAULT NULL,
  `type` varchar(4) DEFAULT NULL,
  `img_dir` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `exp_id` (`exp_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `experiment_images_ibfk_1` FOREIGN KEY (`exp_id`) REFERENCES `experiments` (`exp_id`),
  CONSTRAINT `experiment_images_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `experiments` (`users_id`)
) ENGINE=InnoDB AUTO_INCREMENT=137 DEFAULT CHARSET=utf8

CREATE TABLE `experiments` (
  `exp_id` int(11) NOT NULL AUTO_INCREMENT,
  `users_id` int(11) NOT NULL,
  `exp_title` varchar(40) NOT NULL DEFAULT '',
  `exp_birth_date` date NOT NULL,
  `exp_misc_data` json DEFAULT NULL,
  `type` varchar(4) DEFAULT NULL,
  PRIMARY KEY (`exp_id`),
  KEY `users_id` (`users_id`),
  CONSTRAINT `experiments_ibfk_1` FOREIGN KEY (`users_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8
