-- =============================================================================
-- Suertu2s — Esquema SQL para Hostinger (MySQL / MariaDB via phpMyAdmin)
--
-- INSTRUCCIONES PARA HOSTINGER:
-- 1. En Hostinger hPanel -> Bases de datos MySQL -> Crear base de datos y usuario.
-- 2. Entrar a phpMyAdmin -> Seleccionar tu Base de Datos -> Pestaña "SQL" o "Importar".
-- 3. Copia y pega TODO este contenido (o sube este archivo) y haz clic en "Continuar" / "Ejecutar".
-- 4. En las Variables de Entorno (.env.local o Panel de Hostinger / Vercel), agrega:
--      MYSQL_HOST=localhost (o la IP/Host que te da Hostinger)
--      MYSQL_PORT=3306
--      MYSQL_DATABASE=u123456789_suertu2s
--      MYSQL_USER=u123456789_suertu2s_user
--      MYSQL_PASSWORD=tu_contraseña_segura
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. Tabla de Sorteos
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `raffles` (
  `id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `prize_name` VARCHAR(255) NOT NULL,
  `ends_at` DATETIME NOT NULL,
  `status` ENUM('active', 'closed', 'draft') NOT NULL DEFAULT 'active',
  `code` VARCHAR(12) NOT NULL,
  `ticket_min` INT NOT NULL DEFAULT 0,
  `ticket_max` INT NOT NULL DEFAULT 99999,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `raffles_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. Tabla de Paquetes de Ilustraciones
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `packs` (
  `id` VARCHAR(36) NOT NULL,
  `raffle_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `price_clp` INT NOT NULL,
  `ticket_count` INT NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `illustration_urls` JSON NOT NULL,
  `featured` TINYINT(1) NOT NULL DEFAULT 0,
  `sort_order` INT NOT NULL DEFAULT 0,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `packs_slug_unique` (`slug`),
  KEY `packs_raffle_id_idx` (`raffle_id`),
  CONSTRAINT `fk_packs_raffle` FOREIGN KEY (`raffle_id`) REFERENCES `raffles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. Tabla de Afiliados / Vendedores
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `affiliates` (
  `id` VARCHAR(36) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NULL,
  `phone` VARCHAR(50) NULL,
  `commission_type` ENUM('percent', 'fixed') NOT NULL DEFAULT 'percent',
  `commission_value` DECIMAL(12, 2) NOT NULL DEFAULT 10.00,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `notes` TEXT NULL,
  `password_hash` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `affiliates_code_unique` (`code`),
  KEY `affiliates_email_idx` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. Tabla de Pedidos
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `rut` VARCHAR(20) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `status` ENUM('pending', 'paid', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
  `payment_provider` ENUM('flow', 'mock') NULL,
  `payment_external_id` VARCHAR(255) NULL,
  `total_clp` INT NOT NULL,
  `raffle_id` VARCHAR(36) NOT NULL,
  `referral_code` VARCHAR(50) NULL,
  `referral_name` VARCHAR(255) NULL,
  `affiliate_id` VARCHAR(36) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `paid_at` DATETIME NULL,
  `confirmation_email_sent_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  KEY `orders_email_idx` (`email`),
  KEY `orders_status_paid_at_idx` (`status`, `paid_at`),
  KEY `orders_payment_external_id_idx` (`payment_external_id`),
  KEY `orders_referral_code_idx` (`referral_code`),
  KEY `orders_raffle_id_idx` (`raffle_id`),
  KEY `orders_affiliate_id_idx` (`affiliate_id`),
  CONSTRAINT `fk_orders_raffle` FOREIGN KEY (`raffle_id`) REFERENCES `raffles` (`id`),
  CONSTRAINT `fk_orders_affiliate` FOREIGN KEY (`affiliate_id`) REFERENCES `affiliates` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. Tabla de Ítems por Pedido
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` VARCHAR(36) NOT NULL,
  `order_id` VARCHAR(36) NOT NULL,
  `pack_id` VARCHAR(36) NOT NULL,
  `quantity` INT NOT NULL,
  `unit_price_clp` INT NOT NULL,
  `ticket_count` INT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_order_id_idx` (`order_id`),
  KEY `order_items_pack_id_idx` (`pack_id`),
  CONSTRAINT `fk_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_items_pack` FOREIGN KEY (`pack_id`) REFERENCES `packs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. Tabla de Boletos Emitidos
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tickets` (
  `id` VARCHAR(36) NOT NULL,
  `raffle_id` VARCHAR(36) NOT NULL,
  `order_id` VARCHAR(36) NOT NULL,
  `number` INT NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tickets_raffle_number_unique` (`raffle_id`, `number`),
  UNIQUE KEY `tickets_raffle_code_unique` (`raffle_id`, `code`),
  KEY `tickets_email_idx` (`email`),
  KEY `tickets_code_idx` (`code`),
  KEY `tickets_order_id_idx` (`order_id`),
  CONSTRAINT `fk_tickets_raffle` FOREIGN KEY (`raffle_id`) REFERENCES `raffles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tickets_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. Tabla de Pagos/Liquidaciones a Afiliados
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `affiliate_payouts` (
  `id` VARCHAR(36) NOT NULL,
  `affiliate_id` VARCHAR(36) NOT NULL,
  `amount_clp` INT NOT NULL,
  `period_from` DATE NOT NULL,
  `period_to` DATE NOT NULL,
  `note` TEXT NULL,
  `paid_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `affiliate_payouts_affiliate_id_idx` (`affiliate_id`),
  KEY `affiliate_payouts_paid_at_idx` (`paid_at`),
  CONSTRAINT `fk_payouts_affiliate` FOREIGN KEY (`affiliate_id`) REFERENCES `affiliates` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- SEED DE DATOS INICIALES (Sorteo + Packs + Afiliados Demo)
-- =============================================================================

INSERT INTO `raffles` (
  `id`, `title`, `prize_name`, `ends_at`, `status`, `code`, `ticket_min`, `ticket_max`
) VALUES (
  'a0000000-0000-4000-8000-000000000001',
  'Sorteo MOTORRAD CORSA R150 0km 2026',
  'MOTORRAD CORSA R150 2026',
  '2026-10-01 00:00:00',
  'active',
  'S2S26',
  0,
  99999
) ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `prize_name` = VALUES(`prize_name`);

INSERT INTO `packs` (
  `id`, `raffle_id`, `name`, `slug`, `price_clp`, `ticket_count`,
  `image_url`, `illustration_urls`, `featured`, `sort_order`
) VALUES
  (
    'b0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    'Ilustración Puerto Montt',
    'puerto-montt',
    5000,
    1,
    '/images/packs/puertomontt.webp',
    '["/images/packs/puertomontt.webp"]',
    0,
    1
  ),
  (
    'b0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000001',
    'Ilustración Llanquihue',
    'llanquihue',
    8000,
    2,
    '/images/packs/llanquihue.webp',
    '["/images/packs/llanquihue.webp"]',
    0,
    3
  ),
  (
    'b0000000-0000-4000-8000-000000000003',
    'a0000000-0000-4000-8000-000000000001',
    'Ilustración Chiloé',
    'chiloe',
    10000,
    3,
    '/images/packs/chiloe.webp',
    '["/images/packs/chiloe.webp"]',
    1,
    2
  )
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `price_clp` = VALUES(`price_clp`),
  `ticket_count` = VALUES(`ticket_count`);

INSERT INTO `affiliates` (
  `id`, `code`, `name`, `email`, `commission_type`, `commission_value`, `notes`
) VALUES
  (
    'c0000000-0000-4000-8000-000000000001',
    'STJP48',
    'Embajador Sur',
    'embajador@suertu2s.cl',
    'percent',
    10.00,
    'Cuenta demo — clave se setea en panel admin'
  ),
  (
    'c0000000-0000-4000-8000-000000000002',
    'DEMO01',
    'Vendedor Demo',
    'demo@suertu2s.cl',
    'fixed',
    1000.00,
    'Comisión fija $1.000 — clave se setea en panel admin'
  )
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`);
