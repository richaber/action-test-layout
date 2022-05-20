<?php

/**
 * Functions and definitions
 */

define('THEME_VERSION', '1.0.0');
define('THEME_DIR', __DIR__ . '/');
define('THEME_PATH_URL', trailingslashit(get_template_directory_uri()));

/**
 * Theme Setup
 */
add_action(
    'after_setup_theme',
    function () {
        // Let WordPress manage the document title.
        add_theme_support( 'title-tag' );

        // Add automatic feed links in header
        add_theme_support( 'automatic-feed-links' );

        // Add Post Thumbnail Image sizes and support
        add_theme_support( 'post-thumbnails' );

        // Switch default core markup to output valid HTML5.
        add_theme_support(
            'html5',
            [
                'search-form',
                'comment-form',
                'comment-list',
                'gallery',
                'caption'
            ]
        );
    }
);



/// do stuff





