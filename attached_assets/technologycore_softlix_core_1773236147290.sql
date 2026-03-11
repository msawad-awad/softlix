-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- مضيف: localhost:3306
-- وقت الجيل: 11 مارس 2026 الساعة 14:25
-- إصدار الخادم: 10.11.16-MariaDB
-- نسخة PHP: 8.4.17

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- قاعدة بيانات: `technologycore_softlix_core`
--

-- --------------------------------------------------------

--
-- بنية الجدول `careers`
--

CREATE TABLE `careers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(191) DEFAULT NULL,
  `biethdate` date DEFAULT NULL,
  `nationality` varchar(191) DEFAULT NULL,
  `id_type` varchar(191) DEFAULT NULL,
  `id_number` varchar(191) DEFAULT NULL,
  `email` text DEFAULT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `current_situation` varchar(191) DEFAULT NULL,
  `street` varchar(191) DEFAULT NULL,
  `city` varchar(191) DEFAULT NULL,
  `type_time` varchar(191) DEFAULT NULL,
  `position` varchar(191) DEFAULT NULL,
  `start` date DEFAULT NULL,
  `qualification_type` varchar(191) DEFAULT NULL,
  `major` varchar(191) DEFAULT NULL,
  `institution` varchar(191) DEFAULT NULL,
  `graduation_date` varchar(191) DEFAULT NULL,
  `experience_job_title` varchar(191) DEFAULT NULL,
  `experience_departMent` varchar(191) DEFAULT NULL,
  `experience_company_name` varchar(191) DEFAULT NULL,
  `experience_duration` varchar(191) DEFAULT NULL,
  `experience_start_date` date DEFAULT NULL,
  `experience_end_date` date DEFAULT NULL,
  `experience_still_working` varchar(191) DEFAULT NULL,
  `responsibilities_brief` text DEFAULT NULL,
  `training_course_certificate` varchar(191) DEFAULT NULL,
  `training_course_certificate_2` varchar(191) DEFAULT NULL,
  `lang_1` varchar(191) DEFAULT NULL,
  `level_lang_1` varchar(191) DEFAULT NULL,
  `lang_2` varchar(191) DEFAULT NULL,
  `level_lang_2` varchar(191) DEFAULT NULL,
  `emergency_name` varchar(191) DEFAULT NULL,
  `emergency_phone` varchar(191) DEFAULT NULL,
  `megastore_worked` varchar(191) DEFAULT NULL,
  `eligible_to_work_saudi` varchar(191) DEFAULT NULL,
  `files` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `career_images`
--

CREATE TABLE `career_images` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `file` varchar(191) DEFAULT NULL,
  `career_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `category_permissions`
--

CREATE TABLE `category_permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(191) DEFAULT NULL,
  `order` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `category_permissions`
--

INSERT INTO `category_permissions` (`id`, `name`, `order`, `created_at`, `updated_at`) VALUES
(1, 'dashboard', 1, '2024-07-25 04:14:12', '2024-07-25 04:14:12'),
(2, 'faqs', 2, '2024-07-25 04:14:12', '2024-07-25 04:14:12'),
(3, 'roles', 2, '2024-07-25 04:14:12', '2024-07-25 04:14:12'),
(4, 'admins', 2, '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(5, 'services', 2, '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(6, 'consultation_types', 2, '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(7, 'employees', 2, '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(8, 'service_types', 2, '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(9, 'sliders', 2, '2024-07-25 15:25:12', '2024-07-25 15:25:12');

-- --------------------------------------------------------

--
-- بنية الجدول `clients`
--

CREATE TABLE `clients` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(191) DEFAULT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'active',
  `password` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `code` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `clients`
--

INSERT INTO `clients` (`id`, `name`, `email`, `phone`, `status`, `password`, `created_at`, `updated_at`, `code`) VALUES
(1, 'test', 'abdelhamidelsayed925@gmail.com', NULL, 'active', '$2y$10$2FYG0jI8ipTFmh/CZDyLFuz12lHiICaALqUF3a1dJ6.Gtn5KnEyKa', '2024-07-25 15:22:55', '2024-08-13 20:48:46', '1234'),
(2, 'aly', 'aly.abdelhady2@gmail.com', NULL, 'active', '$2y$10$MJI9AUnbbZUrWWun0To3sO7B3wG/TkgbLdeMB/jVUo.EUqIPe05IG', '2024-07-27 10:41:00', '2024-08-01 13:42:01', '1234'),
(3, 'سليمان', 'saalriyaee@gmail.com', NULL, 'active', '$2y$10$qPPO./mJ/o0QFvbA1v.6HeRR4EQwJQq88p7MSY4ZLUg/uz5xMPmwy', '2024-07-29 14:31:52', '2024-08-06 08:53:52', '1234'),
(4, 'مهند', 'msawad.c@softlix.net', NULL, 'active', '$2y$10$hnFa3.kgLdha1dtJRMGK5.jYZ/skHe53qcSO/gUNDtfRVH3u3nv2.', '2024-07-29 17:50:26', '2024-08-01 13:44:06', '1234'),
(5, 'aly', 'eloo.potter40@gmail.com', NULL, 'active', '$2y$10$PeGVQqXlg03RyEW9Y6bkQe1lBt.8EqVBQMY7FJEgXNaW/yMXhMKPG', '2024-07-29 23:47:25', '2024-08-01 08:30:01', '1234'),
(6, 'aly', 'eloo.potter44@gmail.com', NULL, 'active', '$2y$10$aYrcplHj5DlJeyihFhFmgeVpN2s2oECe9hB0DUidrQCAuydhE3xQe', '2024-07-29 23:48:11', '2024-07-29 23:48:11', NULL),
(7, 'elooo', 'eloo.potte540@gmail.com', NULL, 'active', '$2y$10$7I.LEYC167iACrhjq8Ixfu08.RrFrhaLa9wjcfjqk2QwznOnHwhWq', '2024-07-29 23:50:54', '2024-07-29 23:50:54', NULL),
(8, 'aly', 'ali_abdelhady@ek.com', NULL, 'active', '$2y$10$odAmiyZ80n00zLWOdDwGQ.uVxvwwdU.JJJABNwWZLnBZB7OOFKEhS', '2024-07-29 23:51:44', '2024-07-29 23:51:44', NULL),
(9, 'aly', 'eloo.potter42@gmail.com', NULL, 'active', '$2y$10$sIHpm1w5bqNhrkACG21Ew.rFO.RmYp6DB5J6iat.Evkc.AZWAUtPW', '2024-07-29 23:52:13', '2024-07-29 23:52:13', NULL),
(10, 'abdelhamid', 'abdelhamidelsayed187@gmail.com', NULL, 'active', '$2y$10$5e5/TOcbwKr82ChcLdNz0OJ1lLooWYZ7E564bFfOka47RXN.noy7O', '2024-07-30 03:32:53', '2024-07-31 13:23:37', '1234'),
(11, 'أسماء ابراهيم الرياعي', 'assa.m@hotmail.com', NULL, 'active', '$2y$10$Z5WTRAGqU1lRNQ7XbbjzEeUV3tIR0.i.AZxJidDkbOlMilaz2SWHy', '2024-07-30 04:39:29', '2024-07-30 04:39:29', NULL),
(12, 'MUHANNAD MAHMOUD', 'msawad.c@gmail.com', NULL, 'active', '$2y$10$w3a/pH1ynj315r/lLDeO.eVYlrI3diH7a.XZPKfjvkFQRiy8IwEuK', '2024-08-04 17:22:27', '2024-08-04 17:22:47', '1234'),
(13, 'test', 'client@gmail.com', NULL, 'active', '$2y$10$uN2gvAiN/abOgfXSAqpcB.JMTLnsbvbKFrFSvN5fIWEArbQMLkEEy', '2024-08-13 19:37:45', '2024-08-13 19:37:45', NULL);

-- --------------------------------------------------------

--
-- بنية الجدول `consultaions`
--

CREATE TABLE `consultaions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `topic` text DEFAULT NULL,
  `response` text DEFAULT NULL,
  `date` date DEFAULT NULL,
  `time` time DEFAULT NULL,
  `name` varchar(191) DEFAULT NULL,
  `email` varchar(191) DEFAULT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `client_id` bigint(20) UNSIGNED DEFAULT NULL,
  `consult_type_id` bigint(20) UNSIGNED DEFAULT NULL,
  `service_type_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `consultaions`
--

INSERT INTO `consultaions` (`id`, `topic`, `response`, `date`, `time`, `name`, `email`, `phone`, `client_id`, `consult_type_id`, `service_type_id`, `created_at`, `updated_at`) VALUES
(1, 'jkkhbjhb', NULL, '2000-02-02', '00:02:02', NULL, NULL, NULL, 2, 5, NULL, '2024-07-27 14:45:19', '2024-07-27 14:45:19'),
(2, 'محيص', 'شكرا على ثقتكم فينا', '2007-06-06', '07:06:06', NULL, NULL, NULL, 2, 5, NULL, '2024-07-27 20:26:28', '2024-07-29 13:57:46'),
(3, 'اختبار الاستشارات', 'شكرا على ثقتكم فينا 2', '2005-05-05', '05:05:05', NULL, NULL, NULL, 2, 6, NULL, '2024-07-29 13:58:30', '2024-07-29 13:58:59'),
(4, 'تجربة', NULL, NULL, NULL, 'Sulaiman', 'saalriyaee@gmail.com', '0556580004', NULL, 5, NULL, '2024-07-29 14:33:53', '2024-07-29 14:33:53'),
(5, 'hello mahace', NULL, '2005-01-03', '05:01:03', NULL, NULL, NULL, 2, 5, NULL, '2024-07-29 20:11:21', '2024-07-29 20:11:21'),
(6, 'jhjfgfgh', NULL, '2024-07-30', '05:00:00', NULL, NULL, NULL, 2, 5, NULL, '2024-07-29 20:11:48', '2024-07-29 20:11:48'),
(7, 'test', NULL, '2024-07-09', '07:02:02', NULL, NULL, NULL, 2, 5, NULL, '2024-07-29 20:23:01', '2024-07-29 20:23:01'),
(8, 'alyy', NULL, '2024-07-30', '05:00:00', NULL, NULL, NULL, 2, 5, NULL, '2024-07-29 20:27:16', '2024-07-29 20:27:16'),
(9, 'aly test', NULL, '2024-07-30', '05:00:00', NULL, NULL, NULL, 2, 5, NULL, '2024-07-29 20:33:51', '2024-07-29 20:33:51'),
(10, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 10, 5, NULL, '2024-07-30 03:33:20', '2024-07-30 03:33:20'),
(11, 'rgregregrgr', NULL, '2024-07-30', '00:01:01', NULL, NULL, NULL, 10, 6, NULL, '2024-07-30 03:34:23', '2024-07-30 03:34:23'),
(12, 'تجربة test', NULL, '2024-08-08', '02:00:00', NULL, NULL, NULL, 1, 9, NULL, '2024-08-06 08:55:12', '2024-08-06 08:55:12'),
(13, 'كيف توسس شركة', NULL, '2024-08-22', '04:08:00', NULL, NULL, NULL, 1, 6, NULL, '2024-08-06 08:56:10', '2024-08-06 08:56:10'),
(14, 'how to read legal bill?', NULL, '2024-08-28', '00:00:05', NULL, NULL, NULL, 1, 10, NULL, '2024-08-06 08:59:52', '2024-08-06 08:59:52'),
(15, 'test topic', NULL, NULL, NULL, NULL, NULL, NULL, 13, NULL, 3, '2024-08-13 19:38:38', '2024-08-13 19:38:38'),
(16, 'teeest', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 6, '2024-08-13 20:26:17', '2024-08-13 20:26:17'),
(17, 'test', NULL, NULL, NULL, NULL, NULL, NULL, 10, NULL, 6, '2024-08-14 08:39:31', '2024-08-14 08:39:31'),
(18, 'تجربه', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 9, '2024-08-15 04:52:23', '2024-08-15 04:52:23');

-- --------------------------------------------------------

--
-- بنية الجدول `consult_types`
--

CREATE TABLE `consult_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `consult_types`
--

INSERT INTO `consult_types` (`id`, `created_at`, `updated_at`) VALUES
(4, '2024-07-27 12:39:37', '2024-07-27 12:39:37'),
(5, '2024-07-27 12:40:03', '2024-07-27 12:40:03'),
(6, '2024-07-27 12:40:48', '2024-07-27 12:40:48'),
(7, '2024-07-30 06:31:15', '2024-07-30 06:31:15'),
(9, '2024-07-30 06:33:09', '2024-07-30 06:33:09'),
(10, '2024-07-30 06:33:30', '2024-07-30 06:33:30'),
(11, '2024-07-30 06:33:48', '2024-07-30 06:33:48'),
(12, '2024-07-30 07:02:11', '2024-07-30 07:02:11'),
(13, '2024-07-30 07:02:35', '2024-07-30 07:02:35');

-- --------------------------------------------------------

--
-- بنية الجدول `consult_type_translations`
--

CREATE TABLE `consult_type_translations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `consult_type_id` bigint(20) UNSIGNED NOT NULL,
  `locale` varchar(191) NOT NULL,
  `name` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `consult_type_translations`
--

INSERT INTO `consult_type_translations` (`id`, `consult_type_id`, `locale`, `name`) VALUES
(7, 4, 'en', 'Choose the type of consultation'),
(8, 4, 'ar', 'اختر نوع الاستشارة'),
(9, 5, 'en', 'Labor consultation'),
(10, 5, 'ar', 'استشارة عمالية'),
(11, 6, 'en', 'Business Consulting'),
(12, 6, 'ar', 'استشارة تجارية'),
(13, 7, 'en', 'Criminal counseling'),
(14, 7, 'ar', 'استشاره جنائية'),
(17, 9, 'en', 'Personal status consultation'),
(18, 9, 'ar', 'استشارة أحوال شخصيه'),
(19, 10, 'en', 'Legal advice'),
(20, 10, 'ar', 'استشارة حقوقيه'),
(21, 11, 'en', 'Implementation consulting'),
(22, 11, 'ar', 'استشارة تنفيذ'),
(23, 12, 'en', 'Administrative consultation'),
(24, 12, 'ar', 'استشارة إدراي'),
(25, 13, 'en', 'Other'),
(26, 13, 'ar', 'اخرى');

-- --------------------------------------------------------

--
-- بنية الجدول `contacts`
--

CREATE TABLE `contacts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` text DEFAULT NULL,
  `email` text DEFAULT NULL,
  `message` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(191) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `faqs`
--

CREATE TABLE `faqs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `slug` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `faqs`
--

INSERT INTO `faqs` (`id`, `slug`, `created_at`, `updated_at`) VALUES
(1, NULL, '2024-07-26 00:10:56', '2024-07-26 00:10:56'),
(2, NULL, '2024-07-26 00:12:06', '2024-07-26 00:12:06'),
(3, NULL, '2024-07-26 00:12:49', '2024-07-26 00:12:49');

-- --------------------------------------------------------

--
-- بنية الجدول `faq_translations`
--

CREATE TABLE `faq_translations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `faq_id` bigint(20) UNSIGNED NOT NULL,
  `locale` varchar(191) NOT NULL,
  `question` text NOT NULL,
  `answer` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `faq_translations`
--

INSERT INTO `faq_translations` (`id`, `faq_id`, `locale`, `question`, `answer`) VALUES
(1, 1, 'en', '1. What are the legal services provided by Mahace Law Firm?', 'You can schedule a consultation by calling us on the phone number listed or by filling out the form available on the website.'),
(2, 1, 'ar', '1. ما هي خدمات المحاماة التي تقدمها شركة محيص؟', 'يمكنك تحديد موعد استشارة عبر الاتصال بنا على رقم الهاتف المدرج أو من خلال تعبئة النموذج المتاح على الموقع.'),
(3, 2, 'en', '2. How can I schedule a legal consultation?', 'Mahace Law Firm and Legal Consultations is a Saudi law firm licensed by the Ministry of Justice to provide consultations and services to individuals and companies.'),
(4, 2, 'ar', '2. كيف يمكنني تحديد موعد استشارة قانونية؟', 'شركة محيص للمحاماة والاستشارات القانونية شركة محاماة سعودية مرخصة من وزارة العدل لتقديم الاستشارات والخدمات للأفراد والشركات.'),
(5, 3, 'en', '3. What are the costs of legal advice?', 'Costs vary depending on the type of service required. Please contact us for an accurate estimate.'),
(6, 3, 'ar', '3. ما هي تكاليف الاستشارة القانونية؟', 'تختلف التكاليف حسب نوع الخدمة المطلوبة. يرجى الاتصال بنا للحصول على تقدير دقيقة');

-- --------------------------------------------------------

--
-- بنية الجدول `languages`
--

CREATE TABLE `languages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL,
  `dir` enum('ltr','rtl') NOT NULL DEFAULT 'ltr',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(191) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2014_10_12_000000_create_users_table', 1),
(2, '2014_10_12_100000_create_password_reset_tokens_table', 1),
(3, '2014_10_12_100000_create_password_resets_table', 1),
(4, '2019_08_19_000000_create_failed_jobs_table', 1),
(5, '2019_12_14_000001_create_category_permissions_table', 1),
(6, '2019_12_14_000001_create_personal_access_tokens_table', 1),
(7, '2023_06_10_131502_create_permission_tables', 1),
(8, '2024_01_27_110748_create_languages_table', 1),
(9, '2024_01_31_144133_create_faqs_table', 1),
(10, '2024_01_31_144142_create_faq_translations_table', 1),
(11, '2024_02_02_170041_create_settings_table', 1),
(12, '2024_02_04_102648_create_services_table', 1),
(13, '2024_02_04_102810_create_service_translations_table', 1),
(14, '2024_02_04_123206_create_pages_table', 1),
(15, '2024_02_04_123236_create_page_translations_table', 1),
(16, '2024_02_04_145736_create_page_images_table', 1),
(17, '2024_02_14_090556_create_contacts_table', 1),
(18, '2024_02_14_090602_create_careers_table', 1),
(19, '2024_02_15_170020_create_career_images_table', 1),
(20, '2024_07_23_155819_create_service_types_table', 1),
(21, '2024_07_23_155923_create_service_type_translations_table', 1),
(22, '2024_07_23_161649_create_consult_types_table', 1),
(23, '2024_07_23_161700_create_consult_type_translations_table', 1),
(24, '2024_07_25_160402_create_clients_table', 2),
(25, '2024_07_25_162053_create_consultaions_table', 2),
(26, '2024_07_27_205619_create_opinions_table', 3),
(27, '2024_07_31_144821_add_code_to_clients_table', 4);

-- --------------------------------------------------------

--
-- بنية الجدول `model_has_permissions`
--

CREATE TABLE `model_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(191) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `model_has_roles`
--

CREATE TABLE `model_has_roles` (
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(191) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `model_has_roles`
--

INSERT INTO `model_has_roles` (`role_id`, `model_type`, `model_id`) VALUES
(1, 'App\\Models\\User', 1);

-- --------------------------------------------------------

--
-- بنية الجدول `opinions`
--

CREATE TABLE `opinions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(191) DEFAULT NULL,
  `opinion` text DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'deactive',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `opinions`
--

INSERT INTO `opinions` (`id`, `name`, `opinion`, `status`, `created_at`, `updated_at`) VALUES
(1, 'علي عبدالهادي', 'توفير بيئة قانونية تفسر أسمي معاني الجودة لتكون نواة مميزة في مجال القانون وتلبية احتياجات الأفراد وأصحاب الأعمال والمنشآت بتوفير الحماية القانونية لهم بطرق مبتكرة ومحترفة', 'active', '2024-07-27 20:15:31', '2024-07-27 20:15:31'),
(2, 'علي عبدالهادي', 'توفير بيئة قانونية تفسر أسمي معاني الجودة لتكون نواة مميزة في مجال القانون وتلبية احتياجات الأفراد وأصحاب الأعمال والمنشآت بتوفير الحماية القانونية لهم بطرق مبتكرة ومحترفة', 'active', '2024-07-27 20:16:19', '2024-07-27 20:16:19'),
(3, 'علي عبدالهادي', 'توفير بيئة قانونية تفسر أسمي معاني الجودة لتكون نواة مميزة في مجال القانون وتلبية احتياجات الأفراد وأصحاب الأعمال والمنشآت بتوفير الحماية القانونية لهم بطرق مبتكرة ومحترفة', 'active', '2024-07-27 20:16:43', '2024-07-27 20:16:43'),
(4, 'علي عبدالهادي', 'توفير بيئة قانونية تفسر أسمي معاني الجودة لتكون نواة مميزة في مجال القانون وتلبية احتياجات الأفراد وأصحاب الأعمال والمنشآت بتوفير الحماية القانونية لهم بطرق مبتكرة ومحترفة', 'active', '2024-07-27 20:17:16', '2024-07-27 20:17:16'),
(5, 'علي عبدالهادي', 'توفير بيئة قانونية تفسر أسمي معاني الجودة لتكون نواة مميزة في مجال القانون وتلبية احتياجات الأفراد وأصحاب الأعمال والمنشآت بتوفير الحماية القانونية لهم بطرق مبتكرة ومحترفة', 'active', '2024-07-27 20:17:22', '2024-07-27 20:17:22'),
(6, 'علي عبدالهادي', 'توفير بيئة قانونية تفسر أسمي معاني الجودة لتكون نواة مميزة في مجال القانون وتلبية احتياجات الأفراد وأصحاب الأعمال والمنشآت بتوفير الحماية القانونية لهم بطرق مبتكرة ومحترفة', 'active', '2024-07-27 20:17:27', '2024-07-27 20:17:27');

-- --------------------------------------------------------

--
-- بنية الجدول `pages`
--

CREATE TABLE `pages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `key` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `pages`
--

INSERT INTO `pages` (`id`, `name`, `key`, `created_at`, `updated_at`) VALUES
(1, 'navbar', 'home', '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(2, 'navbar', 'services', '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(3, 'navbar', 'about_us', '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(4, 'navbar', 'faqs', '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(5, 'navbar', 'contact_us', '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(6, 'navbar', 'send_consultation', '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(7, 'navbar', 'consultation_request', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(8, 'footer', 'all_rights_are_saved', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(9, 'footer', 'privacy', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(10, 'footer', 'terms', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(11, 'home', 'about_us', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(12, 'home', 'contact_button', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(13, 'home', 'why_us', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(14, 'home', 'message', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(15, 'home', 'message_desc', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(16, 'home', 'Vision', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(17, 'home', 'Vision_desc', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(18, 'home', 'goal', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(19, 'home', 'goal_desc', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(20, 'home', 'our_services', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(21, 'home', 'customers_opinions', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(22, 'home', 'Leave_comment', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(23, 'home', 'Add_your_comment_popup', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(24, 'home', 'name_of_comment_popup', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(25, 'home', 'comment_of_comment_popup', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(26, 'home', 'cancel_of_comment_popup', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(27, 'home', 'send_of_comment_popup', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(28, 'services', 'services', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(29, 'about_us', 'about_us', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(30, 'about_us', 'message', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(31, 'about_us', 'message_desc', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(32, 'about_us', 'Vision', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(33, 'about_us', 'Vision_desc', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(34, 'about_us', 'goal', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(35, 'about_us', 'goal_desc', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(36, 'about_us', 'Our_team', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(37, 'about_us', 'Our_team_desc', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(38, 'faqs', 'faqs', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(39, 'contact_us', 'contact_us', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(40, 'contact_us', 'name', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(41, 'contact_us', 'email', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(42, 'contact_us', 'phone', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(43, 'contact_us', 'select', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(44, 'contact_us', 'consultation_request', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(45, 'contact_us', 'service_request', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(46, 'contact_us', 'message', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(47, 'contact_us', 'send', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(48, 'contact_section', 'have_question', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(49, 'contact_section', 'phone', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(50, 'contact_section', 'email', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(51, 'contact_section', 'address', '2024-07-25 04:14:14', '2024-07-25 04:14:14'),
(52, 'contact_section', 'Appointments', '2024-07-25 04:14:15', '2024-07-25 04:14:15'),
(53, 'contact_section', 'Let_us_take_you', '2024-07-25 04:14:15', '2024-07-25 04:14:15'),
(54, 'auth', 'login_title', '2024-07-25 04:14:15', '2024-07-25 04:14:15'),
(55, 'auth', 'email', '2024-07-25 04:14:15', '2024-07-25 04:14:15'),
(56, 'auth', 'password', '2024-07-25 04:14:15', '2024-07-25 04:14:15'),
(57, 'auth', 'login_button', '2024-07-25 04:14:15', '2024-07-25 04:14:15'),
(58, 'auth', 'have_account', '2024-07-25 04:14:15', '2024-07-25 04:14:15'),
(59, 'auth', 'login_account', '2024-07-25 04:14:15', '2024-07-25 04:14:15'),
(60, 'auth', 'create_account_button', '2024-07-25 04:14:15', '2024-07-25 04:14:15'),
(61, 'auth', 'name', '2024-07-25 04:14:15', '2024-07-25 04:14:15'),
(62, 'auth', 'phone', '2024-07-25 04:14:15', '2024-07-25 04:14:15'),
(63, 'auth', 'confirm_password', '2024-07-25 04:14:15', '2024-07-25 04:14:15'),
(64, 'auth', 'already_have_account', '2024-07-25 04:14:15', '2024-07-25 04:14:15'),
(65, 'consultation', 'consultation', '2024-07-25 04:14:15', '2024-07-25 04:14:15'),
(66, 'consultation', 'get_consultation', '2024-07-25 04:14:15', '2024-07-25 04:14:15'),
(67, 'consultation', 'consultation_desc', '2024-07-25 04:14:15', '2024-07-25 04:14:15'),
(68, 'consultation', 'consultation_type', '2024-07-25 04:14:15', '2024-07-25 04:14:15'),
(69, 'consultation', 'message', '2024-07-25 04:14:15', '2024-07-25 04:14:15'),
(70, 'consultation', 'date', '2024-07-25 04:14:15', '2024-07-25 04:14:15'),
(71, 'consultation', 'time', '2024-07-25 04:14:15', '2024-07-25 04:14:15'),
(72, 'consultation', 'send', '2024-07-25 04:14:15', '2024-07-25 04:14:15'),
(73, 'pages_title', 'home_title', '2024-07-25 15:25:12', '2024-07-25 15:25:12'),
(74, 'pages_title', 'services_title', '2024-07-25 15:25:12', '2024-07-25 15:25:12'),
(75, 'pages_title', 'about_us_title', '2024-07-25 15:25:13', '2024-07-25 15:25:13'),
(76, 'pages_title', 'faqs_title', '2024-07-25 15:25:13', '2024-07-25 15:25:13'),
(77, 'pages_title', 'contact_us_title', '2024-07-25 15:25:13', '2024-07-25 15:25:13'),
(78, 'pages_title', 'consultation_title', '2024-07-25 15:25:13', '2024-07-25 15:25:13'),
(79, 'pages_title', 'privacy_title', '2024-07-25 15:32:20', '2024-07-25 15:32:20'),
(80, 'pages_title', 'terms_title', '2024-07-25 15:32:20', '2024-07-25 15:32:20'),
(81, 'navbar', 'logout', '2024-07-26 15:22:40', '2024-07-26 15:22:40'),
(82, 'about_us', 'about_us_title', '2024-07-27 11:11:47', '2024-07-27 11:11:47'),
(83, 'privacy', 'privacy', '2024-07-27 19:28:25', '2024-07-27 19:28:25'),
(84, 'terms', 'terms', '2024-07-27 19:28:25', '2024-07-27 19:28:25'),
(85, 'services', 'more_details', '2024-07-29 04:51:08', '2024-07-29 04:51:08');

-- --------------------------------------------------------

--
-- بنية الجدول `page_images`
--

CREATE TABLE `page_images` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `key` varchar(191) DEFAULT NULL,
  `image` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `page_images`
--

INSERT INTO `page_images` (`id`, `name`, `key`, `image`, `created_at`, `updated_at`) VALUES
(1, 'home', 'about_image', '4797172362224966bc636997f65.png', '2024-07-25 04:14:15', '2024-08-14 05:57:29'),
(2, 'home', 'under_titl', '3761172195637466a2f8160d6b3.png', '2024-07-25 04:14:15', '2024-07-25 23:12:54'),
(3, 'services', 'main_image', '7809172224808466a76b94b70dc.png', '2024-07-25 04:14:15', '2024-07-29 08:14:44'),
(4, 'about_us', 'main_image', '1555172195875766a30165c3b05.png', '2024-07-25 04:14:15', '2024-07-25 23:52:37'),
(5, 'about_us', 'message', '8354172195875766a30165c618a.png', '2024-07-25 04:14:15', '2024-07-25 23:52:37'),
(6, 'about_us', 'Vision', '1831172195875766a30165c8654.png', '2024-07-25 04:14:15', '2024-07-25 23:52:37'),
(7, 'about_us', 'goal', '2492172195875766a30165cabd1.png', '2024-07-25 04:14:15', '2024-07-25 23:52:37'),
(8, 'about_us', 'our_teams', '9643172195875766a30165cd23b.jpg', '2024-07-25 04:14:15', '2024-07-25 23:52:37'),
(9, 'faqs', 'main_image', '3155172195879966a3018fb5b3e.png', '2024-07-25 04:14:15', '2024-07-25 23:53:19'),
(10, 'consultation', 'main_image', '6856172195928366a30373a22b4.png', '2024-07-25 04:14:15', '2024-07-26 00:01:23'),
(11, 'drive', 'top_image', 'top_image.png', '2024-07-25 04:14:15', '2024-07-25 04:14:15'),
(12, 'drive', 'why_choose_mahace', 'why_choose_mahace.png', '2024-07-25 04:14:15', '2024-07-25 04:14:15'),
(13, 'drive', 'Becoming_Driver', 'Becoming_Driver.png', '2024-07-25 04:14:15', '2024-07-25 04:14:15'),
(14, 'drive', 'Become_Driver_Partner', 'Become_Driver_Partner.png', '2024-07-25 04:14:15', '2024-07-25 04:14:15'),
(15, 'contact_us', 'main_image', '5600172208996966a501f1cc98a.png', '2024-07-27 11:11:47', '2024-07-27 12:19:29'),
(16, 'privacy', 'main_image', '8147172211657466a569ded24f3.png', '2024-07-27 19:28:25', '2024-07-27 19:42:54'),
(17, 'terms', 'main_image', '6572172211658966a569ed85448.png', '2024-07-27 19:28:25', '2024-07-27 19:43:09');

-- --------------------------------------------------------

--
-- بنية الجدول `page_translations`
--

CREATE TABLE `page_translations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `page_id` bigint(20) UNSIGNED NOT NULL,
  `locale` varchar(191) NOT NULL,
  `value` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `page_translations`
--

INSERT INTO `page_translations` (`id`, `page_id`, `locale`, `value`) VALUES
(1, 1, 'en', 'HOME'),
(2, 2, 'en', 'SERVICES'),
(3, 3, 'en', 'ABOUT US'),
(4, 4, 'en', 'FAQS'),
(5, 5, 'en', 'CONTACT US'),
(6, 6, 'en', 'SEND YOUR CONSULTATION NOW'),
(7, 7, 'en', 'REQUEST A CONSULTATION'),
(8, 8, 'en', 'All rights reserved © 2024'),
(9, 9, 'en', 'Privacy Policy'),
(10, 10, 'en', 'Terms and Conditions'),
(11, 11, 'en', 'Mahace Law Firm and Legal Consultations is a Saudi law firm licensed by the Ministry of Justice to provide consultations and services to individuals and companies. We have a carefully selected team of experienced legal professionals who strive to provide the best level of service with high capacity and efficiency. Our company members are known for their integrity, diligence, hard work, and ability to evaluate legal situations and provide services effectively and quickly, which is coupled with our ability to find innovative solutions'),
(12, 12, 'en', 'Contact Us'),
(13, 13, 'en', 'Why Us'),
(14, 14, 'en', 'Message'),
(15, 15, 'en', 'Providing a legal environment that interprets the highest meanings of quality to be a distinguished nucleus in the field of law and to meet the needs of individuals, business owners and establishments by providing them with legal protection in innovative and professional ways.'),
(16, 16, 'en', 'Vision'),
(17, 17, 'en', 'We look forward to our company being a leader in providing legal services through sustainable growth driven by innovation in creating legal solutions and to be among the professional entities according to international standards.'),
(18, 18, 'en', 'Goal'),
(19, 19, 'en', 'We aim to be one of the best national law firms by providing quality services in innovative ways to keep pace with global legal methodologies.'),
(20, 20, 'en', 'Our Services'),
(21, 21, 'en', 'Customers Opinions'),
(22, 22, 'en', 'Add Comment'),
(23, 23, 'en', 'Add your comment'),
(24, 24, 'en', 'Name'),
(25, 25, 'en', 'Write your comment'),
(26, 26, 'en', 'Cancel'),
(27, 27, 'en', 'Send'),
(28, 28, 'en', 'Services'),
(29, 29, 'en', 'Mahace Law Firm and Legal Consultations is a Saudi law firm licensed by the Ministry of Justice to provide consultations and services to individuals and companies. We have a carefully selected team of experienced legal professionals who strive to provide the best level of service with high capacity and efficiency. Our company members are known for their integrity, diligence, hard work, and ability to evaluate legal situations and provide services effectively and quickly, which is coupled with our ability to find innovative solutions'),
(30, 30, 'en', 'Message'),
(31, 31, 'en', 'Providing a legal environment that interprets the highest meanings of quality to be a distinguished nucleus in the field of law and to meet the needs of individuals, business owners and establishments by providing them with legal protection in innovative and professional ways.'),
(32, 32, 'en', 'Vision'),
(33, 33, 'en', 'We look forward to our company being a leader in providing legal services through sustainable growth driven by innovation in creating legal solutions and to be among the professional entities according to international standards.'),
(34, 34, 'en', 'Goal'),
(35, 35, 'en', 'We aim to be one of the best national law firms by providing quality services in innovative ways to keep pace with global legal methodologies.'),
(36, 36, 'en', 'Our Team'),
(37, 37, 'en', 'A distinguished elite of consultants specialized in the legal field'),
(38, 38, 'en', 'FaQs'),
(39, 39, 'en', 'Contact Us'),
(40, 40, 'en', 'Name'),
(41, 41, 'en', 'Email'),
(42, 42, 'en', 'Phone'),
(43, 43, 'en', 'Select'),
(44, 44, 'en', 'Request a consultation'),
(45, 45, 'en', 'Service Request'),
(46, 46, 'en', 'Message'),
(47, 47, 'en', 'Send'),
(48, 48, 'en', 'Do you have a question or need legal advice? We are here to help. You can contact us via:'),
(49, 49, 'en', '+966570754549'),
(50, 50, 'en', 'email.example@gmail.com'),
(51, 51, 'en', 'Northern Ring Road Branch, Al Wadi, Northern Ring Road Opposite Water Authority, Riyadh 13313, Saudi Arabia'),
(52, 52, 'en', 'From Sunday to Thursday: from 9:00 to 21:00'),
(53, 53, 'en', 'let_us_take_you'),
(54, 54, 'en', 'Login'),
(55, 55, 'en', 'Email'),
(56, 56, 'en', 'Password'),
(57, 57, 'en', 'Login'),
(58, 58, 'en', 'Don\'t have an account?'),
(59, 59, 'en', 'Create account'),
(60, 60, 'en', 'Create account'),
(61, 61, 'en', 'Name'),
(62, 62, 'en', 'Phone'),
(63, 63, 'en', 'Password'),
(64, 64, 'en', 'Already have an account?'),
(65, 65, 'en', 'Request a consultation'),
(66, 66, 'en', 'Get a consultation'),
(67, 67, 'en', 'Enter your data and we will respond to you as soon as possible'),
(68, 68, 'en', 'Choose the type of consultation'),
(69, 69, 'en', 'Message'),
(70, 70, 'en', 'Choose consultation date'),
(71, 71, 'en', 'Choose a consultation time'),
(72, 72, 'en', 'Send your consultation'),
(73, 73, 'en', 'home_title'),
(74, 74, 'en', 'services_title'),
(75, 75, 'en', 'about_us_title'),
(76, 76, 'en', 'faqs_title'),
(77, 77, 'en', 'contact_us_title'),
(78, 78, 'en', 'consultation_title'),
(79, 79, 'en', 'privacy'),
(80, 80, 'en', 'terms'),
(81, 1, 'ar', 'الرئيسية'),
(82, 2, 'ar', 'خدماتنا'),
(83, 3, 'ar', 'من نحن'),
(84, 4, 'ar', 'الاسئلة الشائعة'),
(85, 5, 'ar', 'تواصل معنا'),
(86, 6, 'ar', 'أرسل أستشاراتك الآن'),
(87, 7, 'ar', 'طلب استشارة'),
(88, 8, 'ar', 'جميع الحقوق محفوظة © 2024 تم تصميمه بواسطة سوفت لكس'),
(89, 9, 'ar', 'سياسة الخصوصية'),
(90, 10, 'ar', 'الشروط والأحكام'),
(91, 11, 'ar', 'شركة محيص للمحاماة والاستشارات القانونية شركة محاماة سعودية مرخصة من وزارة العدل لتقديم الاستشارات والخدمات للأفراد والشركات. يعمل لدينا فريق مختار بعناية من القانونيين المتمرسين بحيث نسعى جاهدين لتوفير أفضل مستوى من الخدمة بقدرة وكفاءة عالية. يتميز أعضاء شركتنا بما عرف عنهم من النزاهة و الحرص و العمل الجاد و القدرة على تقييم الاوضاع القانوية وتقديم الخدمات بفاعلية وسرعة , والتي تقترن بمقدرتنا على ايجاد الحلول المبتكرة'),
(92, 12, 'ar', 'تواصل معنا'),
(93, 13, 'ar', 'لماذا نحن'),
(94, 14, 'ar', 'الرسالة'),
(95, 15, 'ar', 'توفير بيئة قانونية تفسر أسمي معاني الجودة لتكون نواة مميزة في مجال القانون وتلبية احتياجات الأفراد وأصحاب الأعمال والمنشآت بتوفير الحماية القانونية لهم بطرق مبتكرة ومحترفة'),
(96, 16, 'ar', 'الرؤية'),
(97, 17, 'ar', 'نتطلع أن تكون لشركتنا الريادة في تقديم الخدمات القانونية وذلك من خلال النمو المستدام المدفوع بالأبتكار في خلق الحلول القانونية وأن نكون ضمن الكيانات المهنية المحترفة وفق المعايير العالمية'),
(98, 18, 'ar', 'الهدف'),
(99, 19, 'ar', 'نهدف إلي أن نكون من أفضل شركات المحاماة الوطنية بتقديم خدمات نوعية بطرق مبدعة لمواكبة المنهجيات القانونية العالمية'),
(100, 20, 'ar', 'خدماتنا'),
(101, 21, 'ar', 'آراء عملائنا'),
(102, 22, 'ar', 'اترك تعليقك'),
(103, 23, 'ar', 'اضف تعليقك'),
(104, 24, 'ar', 'الاسم'),
(105, 25, 'ar', 'اكتب تعليقك'),
(106, 26, 'ar', 'الغاء'),
(107, 27, 'ar', 'ارسل'),
(108, 28, 'ar', 'خدماتنا'),
(109, 38, 'ar', 'الاسئلة الشائعة'),
(110, 65, 'ar', 'طلب استشارة'),
(111, 66, 'ar', 'احصل على استشارة'),
(112, 67, 'ar', 'ادخل بياناتك وسوف نرد عليك في أقرب وقت'),
(113, 68, 'ar', 'اختر نوع الاستشارة'),
(114, 69, 'ar', 'الموضوع'),
(115, 70, 'ar', 'اختر تاريخ الاستشارة'),
(116, 71, 'ar', 'اختر وقت الاستشارة'),
(117, 72, 'ar', 'ارسل استشارتك'),
(118, 81, 'en', 'LOGOUT'),
(119, 81, 'ar', 'تسجيل خروج'),
(120, 29, 'ar', 'شركة محيص للمحاماة والاستشارات القانونية شركة محاماة سعودية مرخصة من وزارة العدل لتقديم الاستشارات والخدمات للأفراد والشركات. يعمل لدينا فريق مختار بعناية من القانونيين المتمرسين بحيث نسعى جاهدين لتوفير أفضل مستوى من الخدمة بقدرة وكفاءة عالية. يتميز أعضاء شركتنا بما عرف عنهم من النزاهة و الحرص و العمل الجاد و القدرة على تقييم الاوضاع القانوية وتقديم الخدمات بفاعلية وسرعة , والتي تقترن بمقدرتنا على ايجاد الحلول المبتكرة'),
(121, 30, 'ar', 'الرسالة'),
(122, 31, 'ar', 'توفير بيئة قانونية تفسر أسمي معاني الجودة لتكون نواة مميزة في مجال القانون وتلبية احتياجات الأفراد وأصحاب الأعمال والمنشآت بتوفير الحماية القانونية لهم بطرق مبتكرة ومحترفة'),
(123, 32, 'ar', 'الرؤية'),
(124, 33, 'ar', 'نتطلع أن تكون لشركتنا الريادة في تقديم الخدمات القانونية وذلك من خلال النمو المستدام المدفوع بالأبتكار في خلق الحلول القانونية وأن نكون ضمن الكيانات المهنية المحترفة وفق المعايير العالمية'),
(125, 34, 'ar', 'الهدف'),
(126, 35, 'ar', 'نهدف إلي أن نكون من أفضل شركات المحاماة الوطنية بتقديم خدمات نوعية بطرق مبدعة لمواكبة المنهجيات القانونية العالمية'),
(127, 36, 'ar', 'فريقنا'),
(128, 37, 'ar', 'نخبة متميزة من المستشارين المتخصصين في المجال القانوني'),
(129, 48, 'ar', 'هل لديك سؤال أو تحتاج إلى مشورة قانونية؟ نحن هنا للمساعدة. يمكنك التواصل معنا عبر:'),
(130, 49, 'ar', '0582400469'),
(131, 50, 'ar', 'Mahace.sa@gmail.com'),
(132, 51, 'ar', 'الطريق الدائري الشمالي الفرعي، الوادي، الطريق الدائري الشمالي مقابل مصلحة المياه، الرياض 13313، المملكة العربية السعودية'),
(133, 52, 'ar', 'من الأحد إلى الخميس : من 08:00 صباحا حتى 09:00 مساء'),
(134, 53, 'ar', NULL),
(135, 82, 'en', 'About Us'),
(136, 82, 'ar', 'من نحن'),
(137, 39, 'ar', 'تواصل معنا'),
(138, 40, 'ar', 'الإسم'),
(139, 41, 'ar', 'البريد الإلكتروني'),
(140, 42, 'ar', 'رقم الموبايل'),
(141, 43, 'ar', 'اختر'),
(142, 44, 'ar', 'طلب استشارة'),
(143, 45, 'ar', 'طلب خدمة'),
(144, 46, 'ar', 'الموضوع'),
(145, 47, 'ar', 'ارسال'),
(146, 54, 'ar', 'تسجيل الدخول'),
(147, 55, 'ar', 'البريد الالكتروني'),
(148, 56, 'ar', 'كلمة المرور'),
(149, 57, 'ar', 'تسجيل دخول'),
(150, 58, 'ar', 'ليس لديك حساب ؟'),
(151, 59, 'ar', 'انشاء الحساب'),
(152, 60, 'ar', 'انشاء حساب'),
(153, 61, 'ar', 'الاسم'),
(154, 62, 'ar', 'رقم الجوال'),
(155, 63, 'ar', 'كلمة المرور'),
(156, 64, 'ar', 'لديك حساب بالفعل ؟'),
(157, 83, 'en', 'Privacy Policy'),
(158, 84, 'en', 'Terms and Conditions'),
(159, 83, 'ar', 'سياسة الخصوصية'),
(160, 84, 'ar', 'الشروط والأحكام'),
(161, 85, 'en', 'More Details'),
(162, 85, 'ar', 'تفاصيل اكثر'),
(163, 73, 'ar', 'home_title'),
(164, 74, 'ar', NULL),
(165, 75, 'ar', NULL),
(166, 76, 'ar', NULL),
(167, 77, 'ar', NULL),
(168, 78, 'ar', NULL),
(169, 79, 'ar', NULL),
(170, 80, 'ar', NULL);

-- --------------------------------------------------------

--
-- بنية الجدول `password_resets`
--

CREATE TABLE `password_resets` (
  `email` varchar(191) NOT NULL,
  `token` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(191) NOT NULL,
  `token` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `category_permission_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(191) NOT NULL,
  `guard_name` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `permissions`
--

INSERT INTO `permissions` (`id`, `category_permission_id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 1, 'admin.home', 'web', '2024-07-25 04:14:12', '2024-07-25 04:14:12'),
(2, 1, 'admin.settings', 'web', '2024-07-25 04:14:12', '2024-07-25 04:14:12'),
(3, 1, 'admin.supports.chat', 'web', '2024-07-25 04:14:12', '2024-07-25 04:14:12'),
(4, 1, 'admin.pages', 'web', '2024-07-25 04:14:12', '2024-07-25 04:14:12'),
(5, 1, 'admin.editPrivacy', 'web', '2024-07-25 04:14:12', '2024-07-25 04:14:12'),
(6, 1, 'admin.editTerms', 'web', '2024-07-25 04:14:12', '2024-07-25 04:14:12'),
(7, 1, 'admin.contacts', 'web', '2024-07-25 04:14:12', '2024-07-25 04:14:12'),
(8, 1, 'admin.careers', 'web', '2024-07-25 04:14:12', '2024-07-25 04:14:12'),
(9, 2, 'admin.faqs.index', 'web', '2024-07-25 04:14:12', '2024-07-25 04:14:12'),
(10, 2, 'admin.faqs.create', 'web', '2024-07-25 04:14:12', '2024-07-25 04:14:12'),
(11, 2, 'admin.faqs.edit', 'web', '2024-07-25 04:14:12', '2024-07-25 04:14:12'),
(12, 2, 'admin.faqs.destroy', 'web', '2024-07-25 04:14:12', '2024-07-25 04:14:12'),
(13, 3, 'admin.roles.index', 'web', '2024-07-25 04:14:12', '2024-07-25 04:14:12'),
(14, 3, 'admin.roles.create', 'web', '2024-07-25 04:14:12', '2024-07-25 04:14:12'),
(15, 3, 'admin.roles.edit', 'web', '2024-07-25 04:14:12', '2024-07-25 04:14:12'),
(16, 3, 'admin.roles.destroy', 'web', '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(17, 4, 'admin.admins.index', 'web', '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(18, 4, 'admin.admins.create', 'web', '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(19, 4, 'admin.admins.edit', 'web', '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(20, 4, 'admin.admins.destroy', 'web', '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(21, 4, 'admin.admins.change_password', 'web', '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(22, 5, 'admin.services.index', 'web', '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(23, 5, 'admin.services.create', 'web', '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(24, 5, 'admin.services.edit', 'web', '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(25, 5, 'admin.services.destroy', 'web', '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(26, 6, 'admin.consultation_types.index', 'web', '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(27, 6, 'admin.consultation_types.create', 'web', '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(28, 6, 'admin.consultation_types.edit', 'web', '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(29, 6, 'admin.consultation_types.destroy', 'web', '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(30, 7, 'admin.employees.index', 'web', '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(31, 7, 'admin.employees.create', 'web', '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(32, 7, 'admin.employees.edit', 'web', '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(33, 7, 'admin.employees.destroy', 'web', '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(34, 8, 'admin.service_types.index', 'web', '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(35, 8, 'admin.service_types.create', 'web', '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(36, 8, 'admin.service_types.edit', 'web', '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(37, 8, 'admin.service_types.destroy', 'web', '2024-07-25 04:14:13', '2024-07-25 04:14:13'),
(38, 9, 'admin.sliders.index', 'web', '2024-07-25 15:25:12', '2024-07-25 15:25:12'),
(39, 9, 'admin.sliders.create', 'web', '2024-07-25 15:25:12', '2024-07-25 15:25:12'),
(40, 9, 'admin.sliders.edit', 'web', '2024-07-25 15:25:12', '2024-07-25 15:25:12'),
(41, 9, 'admin.sliders.destroy', 'web', '2024-07-25 15:25:12', '2024-07-25 15:25:12'),
(42, 1, 'admin.consultations', 'web', '2024-07-29 13:51:46', '2024-07-29 13:51:46'),
(43, 1, 'admin.services_requests', 'web', '2024-07-29 13:51:46', '2024-07-29 13:51:46');

-- --------------------------------------------------------

--
-- بنية الجدول `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(191) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\Client', 1, 'mobile', '73111644dd94c5c7f8416df83284c3f2caf285b773f58b90a18013098a20ebf6', '[\"*\"]', NULL, NULL, '2024-07-25 15:22:55', '2024-07-25 15:22:55'),
(2, 'App\\Models\\Client', 2, 'mobile', 'ca00cd7af7b062ca7d2e169c2ea5be765add538da943ef7d366a73619cf12b39', '[\"*\"]', NULL, NULL, '2024-07-27 10:41:00', '2024-07-27 10:41:00'),
(3, 'App\\Models\\Client', 2, 'mobile', 'e3604e6bb1edc86e45829ed9c9605441c82500747767b4d286d838c034e22321', '[\"*\"]', NULL, NULL, '2024-07-27 13:06:11', '2024-07-27 13:06:11'),
(4, 'App\\Models\\Client', 2, 'mobile', 'b266d6652a8cf790c70bd225266cd6a2568f873af8581d58a8c45e319665696a', '[\"*\"]', NULL, NULL, '2024-07-27 13:06:43', '2024-07-27 13:06:43'),
(5, 'App\\Models\\Client', 2, 'mobile', 'faecebaebead018892b7327a76c050700423e13f7f74c2cea97192b7da638a9c', '[\"*\"]', NULL, NULL, '2024-07-27 13:54:01', '2024-07-27 13:54:01'),
(6, 'App\\Models\\Client', 2, 'mobile', 'a658aaf879644846f6f609a8229a441326aa8eaeab605d23e93db92cd9525ae5', '[\"*\"]', NULL, NULL, '2024-07-27 13:54:24', '2024-07-27 13:54:24'),
(7, 'App\\Models\\Client', 2, 'mobile', '9829ccbd0a79449a90dac845fb640df474ec4083174947de1809f89abea9d6e1', '[\"*\"]', NULL, NULL, '2024-07-27 13:55:06', '2024-07-27 13:55:06'),
(8, 'App\\Models\\Client', 2, 'mobile', 'c70094912712d0033943de56424c21eb445dd40f9641da5819b94db79f6eed86', '[\"*\"]', NULL, NULL, '2024-07-27 13:57:51', '2024-07-27 13:57:51'),
(9, 'App\\Models\\Client', 2, 'mobile', 'a3bbeff5c3b221f2d74043c9f84405e1509a1c8578713eb5a467afd1f12efd52', '[\"*\"]', NULL, NULL, '2024-07-27 14:27:10', '2024-07-27 14:27:10'),
(10, 'App\\Models\\Client', 2, 'mobile', '662cc4df2d0f477e963d032dbd41396194669b6c257ea378f26698d523cb0159', '[\"*\"]', '2024-07-27 14:45:19', NULL, '2024-07-27 14:37:10', '2024-07-27 14:45:19'),
(11, 'App\\Models\\Client', 2, 'mobile', '4a5ff2022700eaf0d2753e8c71afe6b9bf443938f65c92db3bfa0b032e87733c', '[\"*\"]', NULL, NULL, '2024-07-27 19:30:02', '2024-07-27 19:30:02'),
(12, 'App\\Models\\Client', 2, 'mobile', '7c0399d26f01fa6dca040ea3bfcfdff75e41c899e3005105481cb2435bb3ec11', '[\"*\"]', '2024-07-27 21:48:25', NULL, '2024-07-27 20:26:01', '2024-07-27 21:48:25'),
(13, 'App\\Models\\Client', 2, 'mobile', '49cedb4c58288189b406e22ae80851bd0d93e8652cc5b673693f146a9dc7c283', '[\"*\"]', NULL, NULL, '2024-07-27 22:33:54', '2024-07-27 22:33:54'),
(14, 'App\\Models\\Client', 2, 'mobile', '0ae64bb3d67eb5e3ff749cdf93add5d473d520b2c4e641c01990eb1f177b4bcf', '[\"*\"]', NULL, NULL, '2024-07-27 22:34:12', '2024-07-27 22:34:12'),
(15, 'App\\Models\\Client', 2, 'mobile', '64c32f25c6e7392c1e1d78f89de7c95219c51c785bde4baf25fa5ee6fb5148b3', '[\"*\"]', NULL, NULL, '2024-07-27 22:34:46', '2024-07-27 22:34:46'),
(16, 'App\\Models\\Client', 2, 'mobile', '8bca0f66aff6639c09588fbe7244e13d8700eb91d8d1db0f64c3415fb34349c1', '[\"*\"]', NULL, NULL, '2024-07-27 22:35:06', '2024-07-27 22:35:06'),
(17, 'App\\Models\\Client', 2, 'mobile', '55a323428f38a57de15af58e08b50dc5740b54ad7c22756e217f3b9c29b499a7', '[\"*\"]', '2024-07-27 22:57:32', NULL, '2024-07-27 22:35:18', '2024-07-27 22:57:32'),
(18, 'App\\Models\\Client', 2, 'mobile', '2418e531f4be15082a970a07c2ffff99465e8e4e10225cd843d4ecab5b1d4082', '[\"*\"]', NULL, NULL, '2024-07-27 22:57:51', '2024-07-27 22:57:51'),
(19, 'App\\Models\\Client', 2, 'mobile', '5288a86307e2403d130a5d4786ca3ce46c442f0a2cab522b5bd044167ab2f01d', '[\"*\"]', NULL, NULL, '2024-07-27 22:59:48', '2024-07-27 22:59:48'),
(20, 'App\\Models\\Client', 2, 'mobile', '9d05f358f73ab9486fcac1ad2463f62f405f64f7003fa3a148d8f9589245d360', '[\"*\"]', '2024-07-29 20:35:20', NULL, '2024-07-27 23:00:06', '2024-07-29 20:35:20'),
(21, 'App\\Models\\Client', 2, 'mobile', '5f62dd0b00e7ab3042bccf2db094758af79fc14e261cd462bb61c79adbb6f887', '[\"*\"]', '2024-07-28 05:51:46', NULL, '2024-07-28 05:51:45', '2024-07-28 05:51:46'),
(22, 'App\\Models\\Client', 2, 'mobile', '516d9ea3d23f95ef973e79ed0d4921761721650e2883820094bf6c6d49ecec45', '[\"*\"]', '2024-07-29 13:59:04', NULL, '2024-07-29 13:57:18', '2024-07-29 13:59:04'),
(23, 'App\\Models\\Client', 3, 'mobile', '0d90e312e50da84259e260c227b065a755eab100f433ddbe88802b4252a2d151', '[\"*\"]', NULL, NULL, '2024-07-29 14:31:52', '2024-07-29 14:31:52'),
(24, 'App\\Models\\Client', 4, 'mobile', '175d6cd917c4465cff81975c6b83dd626f4c1f96789a8398762d27b4fcb18b30', '[\"*\"]', NULL, NULL, '2024-07-29 17:50:26', '2024-07-29 17:50:26'),
(25, 'App\\Models\\Client', 4, 'mobile', '5514040fa42f8b57b5e0b03f6a1e0f14f9d7491cec1fabaa0d72fde8703859d4', '[\"*\"]', '2024-07-29 17:51:07', NULL, '2024-07-29 17:50:40', '2024-07-29 17:51:07'),
(26, 'App\\Models\\Client', 2, 'mobile', '6efe28e96f467b7cfe21b2ff467853d299ae423eff61a6fbe81385a0d63e214e', '[\"*\"]', '2024-07-29 20:11:53', NULL, '2024-07-29 20:10:45', '2024-07-29 20:11:53'),
(27, 'App\\Models\\Client', 2, 'mobile', '2c03b54accea78314614afffca2b16542f43ce023acf4f2b57e25083ee6ed35d', '[\"*\"]', '2024-07-29 23:41:57', NULL, '2024-07-29 23:41:56', '2024-07-29 23:41:57'),
(28, 'App\\Models\\Client', 5, 'mobile', 'a5882ae56ac6c17bd3c01b6af6dff9eac2f647467314e8d5b332010481294103', '[\"*\"]', '2024-07-29 23:47:40', NULL, '2024-07-29 23:47:25', '2024-07-29 23:47:40'),
(29, 'App\\Models\\Client', 6, 'mobile', '7475a039f54b00450a4314283f90aa7cdcdd500631e81ae2f297d13d28b61143', '[\"*\"]', '2024-07-29 23:48:13', NULL, '2024-07-29 23:48:11', '2024-07-29 23:48:13'),
(30, 'App\\Models\\Client', 7, 'mobile', '6509efdba387dcf06d4a5d68295b1a5d670297c83e0e8bb890dbf08879ba5e3b', '[\"*\"]', '2024-07-29 23:50:55', NULL, '2024-07-29 23:50:54', '2024-07-29 23:50:55'),
(31, 'App\\Models\\Client', 8, 'mobile', '06cc51b55b7c5c7b6b9c9b6e8dcc32e7847e24259b85a9f2641c2b15ed9d6507', '[\"*\"]', '2024-07-29 23:51:46', NULL, '2024-07-29 23:51:44', '2024-07-29 23:51:46'),
(32, 'App\\Models\\Client', 9, 'mobile', '15075e11fc078bf2554f4409343092a3f5a279a8180db4f926b9caaa82224c98', '[\"*\"]', '2024-07-29 23:52:14', NULL, '2024-07-29 23:52:13', '2024-07-29 23:52:14'),
(33, 'App\\Models\\Client', 10, 'mobile', '36628971fff164f28bf0f13df99af8bf8e379b3dc701d3e6bf743c4b8ccc9da4', '[\"*\"]', NULL, NULL, '2024-07-30 03:32:53', '2024-07-30 03:32:53'),
(34, 'App\\Models\\Client', 10, 'mobile', '0115ebb0815cac068759f17cf5b6d2ebb3d674d39efb162f323f43d87d4643d3', '[\"*\"]', '2024-07-30 03:34:30', NULL, '2024-07-30 03:33:08', '2024-07-30 03:34:30'),
(35, 'App\\Models\\Client', 11, 'mobile', '3facd628d98af5194373e0d5e64b9782eeff5981aadcb2b0f02bb096b5b4772d', '[\"*\"]', NULL, NULL, '2024-07-30 04:39:29', '2024-07-30 04:39:29'),
(36, 'App\\Models\\Client', 11, 'mobile', 'a8bfbe3e5282925516aab295a56ba109a91adfbb25eee6351bb08accfd2e5e71', '[\"*\"]', '2024-08-15 08:25:49', NULL, '2024-07-30 04:39:57', '2024-08-15 08:25:49'),
(37, 'App\\Models\\Client', 2, 'mobile', '9387765658b8885998a09230774da258fbc63a64f434c785e2e326780cbd1255', '[\"*\"]', '2024-08-01 12:33:16', NULL, '2024-08-01 12:33:14', '2024-08-01 12:33:16'),
(38, 'App\\Models\\Client', 2, 'mobile', '020e9e64fd8097dbee31867422b2cd5398357b11a7362e035bd9c8dde0af2f4e', '[\"*\"]', '2024-08-01 12:34:12', NULL, '2024-08-01 12:34:10', '2024-08-01 12:34:12'),
(39, 'App\\Models\\Client', 2, 'mobile', 'a8acafbf28ccf9cbe141e4b2b4df4923b9e1dfc762657bbfe79fd1427f69f2bf', '[\"*\"]', '2024-08-07 18:21:34', NULL, '2024-08-01 13:42:01', '2024-08-07 18:21:34'),
(40, 'App\\Models\\Client', 10, 'mobile', 'a1d668f46a1fb80220b74b7ba2bc8d96119f04e5115369ad74b11552056f9863', '[\"*\"]', '2024-08-02 03:39:10', NULL, '2024-08-01 14:54:31', '2024-08-02 03:39:10'),
(41, 'App\\Models\\Client', 12, 'mobile', 'c92130103e21bcafbb6d6f48267fa005f89eb925f852749acedb7a01d27ddd53', '[\"*\"]', '2024-08-04 17:22:28', NULL, '2024-08-04 17:22:27', '2024-08-04 17:22:28'),
(42, 'App\\Models\\Client', 1, 'mobile', '9dd9a714be3a0a9af47fb6b214939755b7a1eee7e192873f3492428da40a0812', '[\"*\"]', '2024-08-15 04:52:23', NULL, '2024-08-06 08:54:34', '2024-08-15 04:52:23'),
(43, 'App\\Models\\Client', 12, 'mobile', '4fe7847300ddd7f3009bcf9437ddba971ac385dfb80132f6e1f82f2a0c574f00', '[\"*\"]', '2024-08-13 11:41:35', NULL, '2024-08-13 11:41:34', '2024-08-13 11:41:35'),
(44, 'App\\Models\\Client', 13, 'mobile', '95aaf8b8eed327a33e24c98280d924786f5e29321756ea95eafd6b4dae323203', '[\"*\"]', '2024-08-13 19:40:51', NULL, '2024-08-13 19:37:45', '2024-08-13 19:40:51'),
(45, 'App\\Models\\Client', 1, 'mobile', 'd697fdd6ed680bf94ead814836bcb6fbcbf563b39aa3f2b5485a04ef4d83bf87', '[\"*\"]', '2024-08-13 20:38:00', NULL, '2024-08-13 20:09:52', '2024-08-13 20:38:00'),
(46, 'App\\Models\\Client', 1, 'mobile', '08e070ddd44068e4b707a4b6ccf78496717347deb04a1a5548aa4f7abd0e4b3f', '[\"*\"]', '2024-08-13 20:39:53', NULL, '2024-08-13 20:39:52', '2024-08-13 20:39:53'),
(47, 'App\\Models\\Client', 1, 'mobile', '2bd317c588239a86c40d3a2258c21dab364e16abb1caecd19c8e97af99223eb6', '[\"*\"]', '2024-08-13 20:55:48', NULL, '2024-08-13 20:48:46', '2024-08-13 20:55:48'),
(48, 'App\\Models\\Client', 10, 'mobile', 'c8c5372f1aa7c258777c6f36b316535f357cf5b1c35738d3ff0cbb66bcc06dbc', '[\"*\"]', '2024-08-14 08:39:34', NULL, '2024-08-14 08:38:59', '2024-08-14 08:39:34'),
(49, 'App\\Models\\Client', 10, 'mobile', '66ba39ea23af6db39d380663359361c3597719e875623342565f5eec55ca42b3', '[\"*\"]', '2024-08-14 08:42:20', NULL, '2024-08-14 08:39:56', '2024-08-14 08:42:20'),
(50, 'App\\Models\\Client', 10, 'mobile', '81b41d704a6320d2f37453c4e69e7b2c55242ead7837a76bae00520b64c17e65', '[\"*\"]', '2024-08-15 04:23:38', NULL, '2024-08-15 04:23:38', '2024-08-15 04:23:38'),
(51, 'App\\Models\\Client', 12, 'mobile', '90bd0c3f1b9d02089b3aa2f8f0d45714bc025ea4271a0cfb536036a22c880dfa', '[\"*\"]', '2024-08-18 08:38:57', NULL, '2024-08-18 08:16:31', '2024-08-18 08:38:57');

-- --------------------------------------------------------

--
-- بنية الجدول `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `is_main` tinyint(1) NOT NULL DEFAULT 0,
  `name` varchar(191) NOT NULL,
  `guard_name` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `roles`
--

INSERT INTO `roles` (`id`, `is_main`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 0, 'SuperAdmin', 'web', '2024-07-25 04:14:13', '2024-07-25 04:14:13');

-- --------------------------------------------------------

--
-- بنية الجدول `role_has_permissions`
--

CREATE TABLE `role_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `role_has_permissions`
--

INSERT INTO `role_has_permissions` (`permission_id`, `role_id`) VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 1),
(5, 1),
(6, 1),
(7, 1),
(8, 1),
(9, 1),
(10, 1),
(11, 1),
(12, 1),
(13, 1),
(14, 1),
(15, 1),
(16, 1),
(17, 1),
(18, 1),
(19, 1),
(20, 1),
(21, 1),
(22, 1),
(23, 1),
(24, 1),
(25, 1),
(26, 1),
(27, 1),
(28, 1),
(29, 1),
(30, 1),
(31, 1),
(32, 1),
(33, 1),
(34, 1),
(35, 1),
(36, 1),
(37, 1),
(38, 1),
(39, 1),
(40, 1),
(41, 1),
(42, 1),
(43, 1);

-- --------------------------------------------------------

--
-- بنية الجدول `services`
--

CREATE TABLE `services` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `image` varchar(191) DEFAULT NULL,
  `url` text DEFAULT NULL,
  `type` varchar(191) NOT NULL,
  `order` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `services`
--

INSERT INTO `services` (`id`, `image`, `url`, `type`, `order`, `created_at`, `updated_at`) VALUES
(4, '1765172195335766a2ec4d5be6d.jpg', 'https://api.whatsapp.com/send/?phone=966582400469&text=s&type=phone_number&app_absent=0', 'sliders', 2, '2024-07-25 21:33:46', '2024-08-14 05:41:56'),
(5, '1291172195052666a2e13eac7a6.jpg', '', 'sliders', 1, '2024-07-25 21:35:26', '2024-07-29 11:58:30'),
(6, '4922172195341466a2ec866cd41.jpg', '', 'sliders', 3, '2024-07-25 21:40:05', '2024-07-29 11:59:17'),
(8, '7372172195965966a304eb2dd44.jpg', '', 'employees', 1, '2024-07-26 00:07:39', '2024-07-26 00:07:39'),
(9, '8757172195970966a3051dc1838.jpg', '', 'employees', 2, '2024-07-26 00:08:29', '2024-07-26 00:08:29'),
(10, '2716172195974466a305403f496.jpg', '', 'employees', 3, '2024-07-26 00:09:04', '2024-07-26 00:09:04'),
(11, '2752172195978766a3056b32044.jpg', '', 'employees', 4, '2024-07-26 00:09:47', '2024-07-26 00:09:47'),
(12, '3416172224782966a76a95742dd.jpg', '', 'services', NULL, '2024-07-29 08:10:29', '2024-07-29 08:10:29'),
(13, '1267172224829866a76c6ad8602.jpg', '', 'services', NULL, '2024-07-29 08:18:18', '2024-07-29 08:18:18'),
(14, '7140172224840266a76cd2ede52.jpg', '', 'services', NULL, '2024-07-29 08:20:02', '2024-07-29 08:20:02');

-- --------------------------------------------------------

--
-- بنية الجدول `service_translations`
--

CREATE TABLE `service_translations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `service_id` bigint(20) UNSIGNED NOT NULL,
  `locale` varchar(191) NOT NULL,
  `title` text NOT NULL,
  `description` text DEFAULT NULL,
  `description2` text DEFAULT NULL,
  `button` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `service_translations`
--

INSERT INTO `service_translations` (`id`, `service_id`, `locale`, `title`, `description`, `description2`, `button`) VALUES
(7, 4, 'en', 'Welcome to', 'Mahace Law Firm for legal advice', NULL, 'Start Now'),
(8, 4, 'ar', 'مرحبا بكم', 'شركة محيص للمحاماة والاستشارات القانونية', NULL, 'ابدا الان'),
(9, 5, 'en', 'A Carefully Selected Team Of', 'Experienced Legal Professionals', NULL, 'More Details'),
(10, 5, 'ar', 'فريق مختار بعناية من', 'القانونيين المتمرسين', NULL, 'تفاصيل اكثر'),
(11, 6, 'en', 'A Carefully Selected Team Of', 'Experienced Legal Professionals', NULL, 'More Details'),
(12, 6, 'ar', 'فريق مختار بعناية من', 'القانونيين المتمرسين', NULL, 'تفاصيل اكثر'),
(15, 8, 'en', 'Aly Abd Elhady', 'Lawyer', NULL, NULL),
(16, 8, 'ar', 'علي عبد الهادي', 'محامي', NULL, NULL),
(17, 9, 'en', 'Mariam Saleh', 'Lawyer', NULL, NULL),
(18, 9, 'ar', 'مريم صالح', 'محامية', NULL, NULL),
(19, 10, 'en', 'Aly Abd Elhady', 'Lawyer', NULL, NULL),
(20, 10, 'ar', 'علي عبدالهادي', 'محامي', NULL, NULL),
(21, 11, 'en', 'Mariam Saleh', 'Lawyer', NULL, NULL),
(22, 11, 'ar', 'مريم صالح', 'محامية', NULL, NULL),
(23, 12, 'en', 'Judicial work', 'Disputes, litigation, compensation cases, estate liquidation, commercial arbitration. Disputes, litigation, compensation cases, estate liquidation, commercial arbitration.', '<ul><li>Settling disputes through alternative means, including conciliation and mediation between the parties to the dispute.</li><li>Pleading in commercial and real estate cases before the commercial judiciary and the general judiciary and judicial committees.</li><li>Objection to administrative decisions.</li><li>Compensation cases and contract disputes against administrative bodies.</li><li>Liquidation of estates by voluntary and compulsory liquidation, and resolution of heir disputes.</li><li>Arbitration of commercial and real estate cases, representation of parties in arbitration cases.</li></ul>', 'Legal service'),
(24, 12, 'ar', 'الأعمال القضائية', 'المنازعات، الترافع في القضايا، قضايا التعويض، تصفية التركات، تحكيم القضايا التجارية .المنازعات، الترافع في القضايا، قضايا التعويض، تصفية التركات، تحكيم القضايا التجارية .', '<ul><li>تسوية المنازعات بالطرق البديلة بما في ذلك الصلح والتوفيق بين أطراف النزاع.</li><li>الترافع في القضايا التجارية والعقارية أمام القضاء التجاري والقضاء العام اللجان القضائية.</li><li>الأعتراض علي القرارات الإدارية.</li><li>قضايا التعويض ومنازعات العقود ضد الجهات الإدارية.</li><li>تصفية التركات بطريقي التصفية الاختيارية، والجبرية، وحل نزاعات الورثة.</li><li>تحكيم القضايا التجارية والعقارية، تمثيل الأطراف في قضايا التحكيم.</li></ul>', 'خدمة قانونية'),
(25, 13, 'en', 'Legal drafting', 'Disputes, litigation, compensation cases, estate liquidation, commercial arbitration. Disputes, litigation, compensation cases, estate liquidation, commercial arbitration.', '<ul>\r\n	<li>Drafting draft regulations and executive bylaws.</li>\r\n	<li>Drafting internal regulations for commercial establishments.</li>\r\n	<li>Drafting response memoranda and objection regulations to judicial rulings.</li>\r\n	<li>Drafting contracts: sales contracts, lease contracts, real estate investment contracts, and investment portfolios.</li>\r\n	<li>Drafting legal letters.</li>\r\n</ul>', 'Legal service'),
(26, 13, 'ar', 'الصياغة القانونية', 'المنازعات، الترافع في القضايا، قضايا التعويض، تصفية التركات، تحكيم القضايا التجارية .المنازعات، الترافع في القضايا، قضايا التعويض، تصفية التركات، تحكيم القضايا التجارية .', '<ul dir=\"rtl\">\r\n	<li>صياغة مشاريع الأنظمة واللوائح التنفيذية.</li>\r\n	<li>صياغة اللوائح الداخلية للمنشآت التجارية.</li>\r\n	<li>صياغة المذكرات الجوابية واللوائح الاعتراضية علي الأحكام القضائية.</li>\r\n	<li>صياغة العقود: عقود البيع، عقود الإيجار، عقد الاستثمارات العقارية، والمحافظ الاستثمارية.</li>\r\n	<li>صياغة الخطابات القانونية.</li>\r\n</ul>', 'خدمة قانونية'),
(27, 14, 'en', 'Commercial agencies', 'Disputes, litigation, compensation cases, estate liquidation, commercial arbitration. Disputes, litigation, compensation cases, estate liquidation, commercial arbitration.', '<ul>\r\n	<li>Drafting commercial agency and franchise contracts.</li>\r\n	<li>Registering and protecting trademarks, and objecting to decisions to reject registration.</li>\r\n</ul>', 'Legal service'),
(28, 14, 'ar', 'الوكالات التجارية', 'المنازعات، الترافع في القضايا، قضايا التعويض، تصفية التركات، تحكيم القضايا التجارية .المنازعات، الترافع في القضايا، قضايا التعويض، تصفية التركات، تحكيم القضايا التجارية .', '<ul dir=\"rtl\">\r\n	<li>صياغة عقود الوكالات التجارية والامتيازالتجاري (الفرنشايز)</li>\r\n	<li>تسجيل العلامة التجارية، وحمايتها، والاعتراض علي قرارات رفض التسجيل.</li>\r\n</ul>', 'خدمة قانونية');

-- --------------------------------------------------------

--
-- بنية الجدول `service_types`
--

CREATE TABLE `service_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `service_types`
--

INSERT INTO `service_types` (`id`, `created_at`, `updated_at`) VALUES
(3, '2024-07-27 12:37:45', '2024-07-27 12:37:45'),
(6, '2024-07-30 06:34:28', '2024-07-30 06:34:28'),
(7, '2024-07-30 06:35:16', '2024-07-30 06:35:16'),
(8, '2024-07-30 06:35:36', '2024-07-30 06:35:36'),
(9, '2024-07-30 06:35:59', '2024-07-30 06:35:59'),
(10, '2024-07-30 06:36:21', '2024-07-30 06:36:21'),
(11, '2024-07-30 06:37:48', '2024-07-30 06:37:48');

-- --------------------------------------------------------

--
-- بنية الجدول `service_type_translations`
--

CREATE TABLE `service_type_translations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `service_type_id` bigint(20) UNSIGNED NOT NULL,
  `locale` varchar(191) NOT NULL,
  `name` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `service_type_translations`
--

INSERT INTO `service_type_translations` (`id`, `service_type_id`, `locale`, `name`) VALUES
(5, 3, 'en', 'Select the type of service'),
(6, 3, 'ar', 'اختر نوع الخدمة'),
(11, 6, 'en', 'Claim service'),
(12, 6, 'ar', 'خدمة رفع دعوى'),
(13, 7, 'en', 'Power of attorney service'),
(14, 7, 'ar', 'خدمة عمل وكاله'),
(15, 8, 'en', 'Implementation request submission service'),
(16, 8, 'ar', 'خدمة رفع طلب تنفيذ'),
(17, 9, 'en', 'Memo writing service'),
(18, 9, 'ar', 'خدمة كتابة مذكره'),
(19, 10, 'en', 'Attend a session'),
(20, 10, 'ar', 'حضور جلسه'),
(21, 11, 'en', 'Other'),
(22, 11, 'ar', 'اخرى');

-- --------------------------------------------------------

--
-- بنية الجدول `settings`
--

CREATE TABLE `settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `key` varchar(191) NOT NULL,
  `value` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `settings`
--

INSERT INTO `settings` (`id`, `key`, `value`, `created_at`, `updated_at`) VALUES
(1, 'general', '{\"title\":\"\\u064a\\u064a\\u064a\",\"logo\":\"9472172512135166d343477c61a.png\",\"favicon\":\"9060172512135166d343477c678.png\",\"second_logo\":\"5685172512135166d343477c6aa.png\",\"tiktok\":null,\"youtube\":null,\"twitter\":null,\"instagram\":null,\"linked_in\":null,\"whatsup\":\"+966500357567\",\"facebook\":null}', '2024-07-25 04:14:13', '2024-08-31 14:22:31'),
(2, 'privacy', '{\"privacy_en\":\"\\u003Cp\\u003E\\u003Ca href=\\\"http:\\/\\/localhost:3000\\/privacy\\\"\\u003EPrivacy Policy\\u003C\\/a\\u003E\\u003C\\/p\\u003E\",\"privacy_ar\":\"\\u003Cp\\u003E\\u003Ca href=\\\"http:\\/\\/localhost:3000\\/privacy\\\"\\u003E\\u0633\\u064a\\u0627\\u0633\\u0629 \\u0627\\u0644\\u062e\\u0635\\u0648\\u0635\\u064a\\u0629\\u003C\\/a\\u003E\\u003C\\/p\\u003E\"}', '2024-07-25 04:14:13', '2024-07-25 22:53:32'),
(3, 'terms', '{\"terms_en\":\"\",\"terms_ar\":\"\"}', '2024-07-25 04:14:13', '2024-07-26 15:22:40');

-- --------------------------------------------------------

--
-- بنية الجدول `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(191) DEFAULT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `image` varchar(191) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'active',
  `password` varchar(191) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `image`, `status`, `password`, `remember_token`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'admin@admin.com', NULL, '7217172226848666a7bb46d80ae.png', 'active', '$2y$10$l0/DEVvmkmYWfd7vDxtj7.AdIqw8.1R.fbzaePR76SuvTAALybLnm', NULL, NULL, '2024-07-25 04:14:13', '2024-07-29 13:54:46');

--
-- Indexes for dumped tables
--

--
-- فهارس للجدول `careers`
--
ALTER TABLE `careers`
  ADD PRIMARY KEY (`id`);

--
-- فهارس للجدول `career_images`
--
ALTER TABLE `career_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `career_images_career_id_foreign` (`career_id`);

--
-- فهارس للجدول `category_permissions`
--
ALTER TABLE `category_permissions`
  ADD PRIMARY KEY (`id`);

--
-- فهارس للجدول `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `clients_email_unique` (`email`);

--
-- فهارس للجدول `consultaions`
--
ALTER TABLE `consultaions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `consultaions_client_id_foreign` (`client_id`),
  ADD KEY `consultaions_consult_type_id_foreign` (`consult_type_id`),
  ADD KEY `consultaions_service_type_id_foreign` (`service_type_id`);

--
-- فهارس للجدول `consult_types`
--
ALTER TABLE `consult_types`
  ADD PRIMARY KEY (`id`);

--
-- فهارس للجدول `consult_type_translations`
--
ALTER TABLE `consult_type_translations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `consult_type_translations_consult_type_id_locale_unique` (`consult_type_id`,`locale`),
  ADD KEY `consult_type_translations_locale_index` (`locale`);

--
-- فهارس للجدول `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`);

--
-- فهارس للجدول `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- فهارس للجدول `faqs`
--
ALTER TABLE `faqs`
  ADD PRIMARY KEY (`id`);

--
-- فهارس للجدول `faq_translations`
--
ALTER TABLE `faq_translations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `faq_translations_faq_id_locale_unique` (`faq_id`,`locale`),
  ADD KEY `faq_translations_locale_index` (`locale`);

--
-- فهارس للجدول `languages`
--
ALTER TABLE `languages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `languages_code_unique` (`code`);

--
-- فهارس للجدول `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- فهارس للجدول `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  ADD KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`);

--
-- فهارس للجدول `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  ADD KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`);

--
-- فهارس للجدول `opinions`
--
ALTER TABLE `opinions`
  ADD PRIMARY KEY (`id`);

--
-- فهارس للجدول `pages`
--
ALTER TABLE `pages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pages_name_index` (`name`);

--
-- فهارس للجدول `page_images`
--
ALTER TABLE `page_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `page_images_name_index` (`name`);

--
-- فهارس للجدول `page_translations`
--
ALTER TABLE `page_translations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `page_translations_page_id_locale_unique` (`page_id`,`locale`),
  ADD KEY `page_translations_locale_index` (`locale`);

--
-- فهارس للجدول `password_resets`
--
ALTER TABLE `password_resets`
  ADD KEY `password_resets_email_index` (`email`);

--
-- فهارس للجدول `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- فهارس للجدول `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`),
  ADD KEY `permissions_category_permission_id_foreign` (`category_permission_id`);

--
-- فهارس للجدول `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- فهارس للجدول `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`);

--
-- فهارس للجدول `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `role_has_permissions_role_id_foreign` (`role_id`);

--
-- فهارس للجدول `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`);

--
-- فهارس للجدول `service_translations`
--
ALTER TABLE `service_translations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `service_translations_service_id_locale_unique` (`service_id`,`locale`),
  ADD KEY `service_translations_locale_index` (`locale`);

--
-- فهارس للجدول `service_types`
--
ALTER TABLE `service_types`
  ADD PRIMARY KEY (`id`);

--
-- فهارس للجدول `service_type_translations`
--
ALTER TABLE `service_type_translations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `service_type_translations_service_type_id_locale_unique` (`service_type_id`,`locale`),
  ADD KEY `service_type_translations_locale_index` (`locale`);

--
-- فهارس للجدول `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`);

--
-- فهارس للجدول `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `careers`
--
ALTER TABLE `careers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `career_images`
--
ALTER TABLE `career_images`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `category_permissions`
--
ALTER TABLE `category_permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `consultaions`
--
ALTER TABLE `consultaions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `consult_types`
--
ALTER TABLE `consult_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `consult_type_translations`
--
ALTER TABLE `consult_type_translations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faqs`
--
ALTER TABLE `faqs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `faq_translations`
--
ALTER TABLE `faq_translations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `languages`
--
ALTER TABLE `languages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `opinions`
--
ALTER TABLE `opinions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `pages`
--
ALTER TABLE `pages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=86;

--
-- AUTO_INCREMENT for table `page_images`
--
ALTER TABLE `page_images`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `page_translations`
--
ALTER TABLE `page_translations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=171;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `service_translations`
--
ALTER TABLE `service_translations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `service_types`
--
ALTER TABLE `service_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `service_type_translations`
--
ALTER TABLE `service_type_translations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- القيود المفروضة على الجداول الملقاة
--

--
-- قيود الجداول `career_images`
--
ALTER TABLE `career_images`
  ADD CONSTRAINT `career_images_career_id_foreign` FOREIGN KEY (`career_id`) REFERENCES `careers` (`id`) ON DELETE CASCADE;

--
-- قيود الجداول `consultaions`
--
ALTER TABLE `consultaions`
  ADD CONSTRAINT `consultaions_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  ADD CONSTRAINT `consultaions_consult_type_id_foreign` FOREIGN KEY (`consult_type_id`) REFERENCES `consult_types` (`id`),
  ADD CONSTRAINT `consultaions_service_type_id_foreign` FOREIGN KEY (`service_type_id`) REFERENCES `service_types` (`id`) ON DELETE CASCADE;

--
-- قيود الجداول `consult_type_translations`
--
ALTER TABLE `consult_type_translations`
  ADD CONSTRAINT `consult_type_translations_consult_type_id_foreign` FOREIGN KEY (`consult_type_id`) REFERENCES `consult_types` (`id`) ON DELETE CASCADE;

--
-- قيود الجداول `faq_translations`
--
ALTER TABLE `faq_translations`
  ADD CONSTRAINT `faq_translations_faq_id_foreign` FOREIGN KEY (`faq_id`) REFERENCES `faqs` (`id`) ON DELETE CASCADE;

--
-- قيود الجداول `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- قيود الجداول `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- قيود الجداول `page_translations`
--
ALTER TABLE `page_translations`
  ADD CONSTRAINT `page_translations_page_id_foreign` FOREIGN KEY (`page_id`) REFERENCES `pages` (`id`) ON DELETE CASCADE;

--
-- قيود الجداول `permissions`
--
ALTER TABLE `permissions`
  ADD CONSTRAINT `permissions_category_permission_id_foreign` FOREIGN KEY (`category_permission_id`) REFERENCES `category_permissions` (`id`) ON DELETE CASCADE;

--
-- قيود الجداول `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- قيود الجداول `service_translations`
--
ALTER TABLE `service_translations`
  ADD CONSTRAINT `service_translations_service_id_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;

--
-- قيود الجداول `service_type_translations`
--
ALTER TABLE `service_type_translations`
  ADD CONSTRAINT `service_type_translations_service_type_id_foreign` FOREIGN KEY (`service_type_id`) REFERENCES `service_types` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
