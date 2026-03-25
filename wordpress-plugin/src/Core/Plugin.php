<?php

namespace ProjectCore\Core;

/**
 * Main Plugin Class.
 *
 * Follows Singleton pattern to ensure only one instance exists.
 *
 * @package ProjectCore\Core
 */
final class Plugin {

	/**
	 * @var Plugin|null The single instance of the class.
	 */
	private static $instance = null;

	/**
	 * @var Loader Orchestrates the hooks.
	 */
	protected $loader;

	/**
	 * Get the singleton instance.
	 *
	 * @return Plugin
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor.
	 * Protected to prevent external instantiation.
	 */
	protected function __construct() {
		$this->loader = new Loader();
	}

	/**
	 * Clone method.
	 * Private to prevent cloning.
	 */
	private function __clone() {}

	/**
	 * Wakeup method.
	 * Private to prevent unserializing.
	 */
	public function __wakeup() {}

	/**
	 * Initialize the plugin.
	 */
	public function run() {
		$this->define_hooks();
		$this->loader->run();
	}

	/**
	 * Register all actions and filters with the loader.
	 */
	private function define_hooks() {
		// 1. Admin Menu
		$admin_menu = new \ProjectCore\Admin\AdminMenu();
		$this->loader->add_action( 'admin_menu', $admin_menu, 'register_menu' );

		// 2. Our Partners CPT
		$partners_cpt = new \ProjectCore\PostTypes\OurPartners();
		$this->loader->add_action( 'init', $partners_cpt, 'register_post_type' );

		// 3. Our Partners Meta Boxes & REST API
		$partners_meta = new \ProjectCore\Admin\OurPartnersMeta();
		$this->loader->add_action( 'add_meta_boxes', $partners_meta, 'add_partner_meta_boxes' );
		$this->loader->add_action( 'save_post', $partners_meta, 'save_partner_metadata' );
		$this->loader->add_action( 'admin_enqueue_scripts', $partners_meta, 'enqueue_media_scripts' );
		$this->loader->add_action( 'rest_api_init', $partners_meta, 'register_rest_fields' );

		// 3.5 Our Customers CPT
		$customers_cpt = new \ProjectCore\PostTypes\OurCustomers();
		$this->loader->add_action( 'init', $customers_cpt, 'register_post_type' );

		// 3.6 Our Customers Meta & Gallery
		$customers_meta = new \ProjectCore\Admin\CustomersMeta();
		$this->loader->add_action( 'add_meta_boxes', $customers_meta, 'add_meta_boxes' );
		$this->loader->add_action( 'save_post', $customers_meta, 'save_metadata' );
		$this->loader->add_action( 'admin_enqueue_scripts', $customers_meta, 'enqueue_media_scripts' );
		$this->loader->add_action( 'rest_api_init', $customers_meta, 'register_rest_fields' );

		// 3.7 Our Partners Slider (Simple Logo Slider)
		$partners_slider_cpt = new \ProjectCore\PostTypes\OurPartnersSlider();
		$this->loader->add_action( 'init', $partners_slider_cpt, 'register_post_type' );

		$partners_slider_meta = new \ProjectCore\Admin\PartnersSliderMeta();
		$this->loader->add_action( 'add_meta_boxes', $partners_slider_meta, 'add_meta_boxes' );
		$this->loader->add_action( 'save_post', $partners_slider_meta, 'save_metadata' );
		$this->loader->add_action( 'admin_enqueue_scripts', $partners_slider_meta, 'enqueue_media_scripts' );
		$this->loader->add_action( 'rest_api_init', $partners_slider_meta, 'register_rest_fields' );

		// 3.8 Hero Slider (Main Homepage Slides)
		$hero_slider_cpt = new \ProjectCore\PostTypes\HeroSlider();
		$this->loader->add_action( 'init', $hero_slider_cpt, 'register_post_type' );

		$hero_meta = new \ProjectCore\Admin\HeroMeta();
		$this->loader->add_action( 'add_meta_boxes', $hero_meta, 'add_meta_boxes' );
		$this->loader->add_action( 'save_post', $hero_meta, 'save_metadata' );
		$this->loader->add_action( 'rest_api_init', $hero_meta, 'register_rest_fields' );

		// 3.9 Home Categories (3D Category Slider)
		$home_categories_cpt = new \ProjectCore\PostTypes\HomeCategories();
		$this->loader->add_action( 'init', $home_categories_cpt, 'register_post_type' );

		$home_categories_meta = new \ProjectCore\Admin\HomeCategoriesMeta();
		$this->loader->add_action( 'add_meta_boxes', $home_categories_meta, 'add_meta_boxes' );
		$this->loader->add_action( 'save_post', $home_categories_meta, 'save_metadata' );
		$this->loader->add_action( 'admin_enqueue_scripts', $home_categories_meta, 'enqueue_media_scripts' );
		$this->loader->add_action( 'rest_api_init', $home_categories_meta, 'register_rest_fields' );

		// 4. Register Product REST Fields (e.g. ACF fields for WooCommerce products)
		$product_fields = new \ProjectCore\API\ProductRestFields();
		$this->loader->add_action( 'rest_api_init', $product_fields, 'register_fields' );

		// 3.10 Home Video Section
		$home_video_cpt = new \ProjectCore\PostTypes\HomeVideo();
		$this->loader->add_action( 'init', $home_video_cpt, 'register_post_type' );

		$home_video_meta = new \ProjectCore\Admin\HomeVideoMeta();
		$this->loader->add_action( 'add_meta_boxes', $home_video_meta, 'register_meta_boxes' );
		$this->loader->add_action( 'save_post', $home_video_meta, 'save_meta_box' );
		$this->loader->add_action( 'rest_api_init', $home_video_meta, 'register_rest_fields' );

		// 3.11 Catalogues CPT
		$catalogue_cpt = new \ProjectCore\PostTypes\Catalogue();
		$this->loader->add_action( 'init', $catalogue_cpt, 'register_post_type' );

		$catalogue_meta = new \ProjectCore\Admin\CatalogueMeta();
		$this->loader->add_action( 'add_meta_boxes', $catalogue_meta, 'add_meta_boxes' );
		$this->loader->add_action( 'save_post', $catalogue_meta, 'save_metadata' );
		$this->loader->add_action( 'admin_enqueue_scripts', $catalogue_meta, 'enqueue_media_scripts' );
		$this->loader->add_action( 'rest_api_init', $catalogue_meta, 'register_rest_fields' );

		// Add more core hooks here as needed...
	}
}
