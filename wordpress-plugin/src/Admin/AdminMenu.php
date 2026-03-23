<?php

namespace ProjectCore\Admin;

/**
 * Class AdminMenu
 *
 * Adds the main Project Core menu to the WordPress admin sidebar.
 *
 * @package ProjectCore\Admin
 */
class AdminMenu {

	/**
	 * Register the admin menu.
	 */
	public function register_menu() {
		add_menu_page(
			__( 'Project Core', 'project-core' ),
			__( 'Project Core', 'project-core' ),
			'manage_options',
			'project-core',
			[ $this, 'render_dashboard' ],
			'dashicons-admin-generic',
			30
		);
	}

	/**
	 * Render the dashboard page.
	 */
	public function render_dashboard() {
		$post_types = [
			'hero-slider'     => [ 'label' => __( 'Hero Slider', 'project-core' ), 'icon' => 'dashicons-images-alt2' ],
			'home-categories' => [ 'label' => __( 'Home Categories', 'project-core' ), 'icon' => 'dashicons-layout' ],
			'home-video'      => [ 'label' => __( 'Home Video', 'project-core' ), 'icon' => 'dashicons-video-alt3' ],
			'our-partners'    => [ 'label' => __( 'Our Partners', 'project-core' ), 'icon' => 'dashicons-groups' ],
			'our-customers'   => [ 'label' => __( 'Our Customers', 'project-core' ), 'icon' => 'dashicons-businessperson' ],
			'partners-slider' => [ 'label' => __( 'Logos Slider', 'project-core' ), 'icon' => 'dashicons-slides' ],
		];

		?>
		<div class="wrap">
			<h1><?php _e( 'Project Core Dashboard', 'project-core' ); ?></h1>
			<p><?php _e( 'Manage your homepage and site-wide dynamic features.', 'project-core' ); ?></p>
			
			<div class="project-core-grid">
				<?php foreach ( $post_types as $slug => $data ) : ?>
					<div class="project-core-card">
						<span class="dashicons <?php echo esc_attr( $data['icon'] ); ?>"></span>
						<h3><?php echo esc_html( $data['label'] ); ?></h3>
						<a href="<?php echo esc_url( admin_url( "edit.php?post_type={$slug}" ) ); ?>" class="button button-primary">
							<?php _e( 'Manage Items', 'project-core' ); ?>
						</a>
						<a href="<?php echo esc_url( admin_url( "post-new.php?post_type={$slug}" ) ); ?>" class="button">
							<?php _e( 'Add New', 'project-core' ); ?>
						</a>
					</div>
				<?php endforeach; ?>
			</div>
		</div>
		<style>
			.project-core-grid {
				display: grid;
				grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
				gap: 20px;
				margin-top: 30px;
			}
			.project-core-card {
				background: #fff;
				padding: 30px;
				border-radius: 8px;
				box-shadow: 0 2px 10px rgba(0,0,0,0.05);
				text-align: center;
				transition: transform 0.2s;
			}
			.project-core-card:hover {
				transform: translateY(-5px);
			}
			.project-core-card .dashicons {
				font-size: 48px;
				width: 48px;
				height: 48px;
				color: #0073aa;
				margin-bottom: 20px;
			}
			.project-core-card h3 {
				margin: 0 0 20px 0;
				font-size: 1.2rem;
			}
			.project-core-card .button {
				margin: 5px;
			}
		</style>
		<?php
	}
}
