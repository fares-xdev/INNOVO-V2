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
			'catalogue'       => [ 'label' => __( 'Catalogues', 'project-core' ), 'icon' => 'dashicons-pdf' ],
			'partners-slider' => [ 'label' => __( 'Logos Slider', 'project-core' ), 'icon' => 'dashicons-slides' ],
		];

		?>
		<div class="wrap">
			<div style="background: #fdfdfd; padding: 40px; border-radius: 12px; border: 1px solid #e2e8f0; margin-top: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
				<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 30px;">
					<div>
						<h1 style="font-size: 2.5rem; font-weight: 800; color: #1a202c; margin: 0; letter-spacing: -0.025em;"><?php _e( 'Project Core <span style="color:#CD2727">Dashboard</span>', 'project-core' ); ?></h1>
						<p style="font-size: 1.1rem; color: #4a5568; margin-top: 8px;"><?php _e( 'Developed & Maintained by <strong style="color:#1a202c">Fares</strong>', 'project-core' ); ?></p>
					</div>
					<div style="text-align: right;">
						<span style="background: #CD2727; color: white; padding: 6px 14px; border-radius: 99px; font-weight: 700; font-size: 0.875rem;">v 1.2.0</span>
					</div>
				</div>
				
				<div class="project-core-grid">
					<?php foreach ( $post_types as $slug => $data ) : ?>
						<div class="project-core-card">
							<div class="icon-wrapper">
								<span class="dashicons <?php echo esc_attr( $data['icon'] ); ?>"></span>
							</div>
							<h3><?php echo esc_html( $data['label'] ); ?></h3>
							<div class="card-footer">
								<a href="<?php echo esc_url( admin_url( "edit.php?post_type={$slug}" ) ); ?>" class="button button-primary manage-btn">
									<?php _e( 'Manage Items', 'project-core' ); ?>
								</a>
								<a href="<?php echo esc_url( admin_url( "post-new.php?post_type={$slug}" ) ); ?>" class="button add-btn">
									<?php _e( 'Add New', 'project-core' ); ?>
								</a>
							</div>
						</div>
					<?php endforeach; ?>
				</div>
			</div>
		</div>

		<style>
			.project-core-grid {
				display: grid;
				grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
				gap: 25px;
			}
			.project-core-card {
				background: #fff;
				padding: 35px;
				border-radius: 15px;
				border: 1px solid #edf2f7;
				text-align: center;
				transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
				position: relative;
				overflow: hidden;
			}
			.project-core-card:hover {
				transform: translateY(-10px);
				box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
				border-color: #CD2727;
			}
			.icon-wrapper {
				background: #f7fafc;
				width: 80px;
				height: 80px;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				margin: 0 auto 20px;
				transition: all 0.3s;
			}
			.project-core-card:hover .icon-wrapper {
				background: #fff5f5;
			}
			.project-core-card .dashicons {
				font-size: 40px;
				width: 40px;
				height: 40px;
				color: #2d3748;
				transition: color 0.3s;
			}
			.project-core-card:hover .dashicons {
				color: #CD2727;
			}
			.project-core-card h3 {
				margin: 0 0 25px 0;
				font-size: 1.4rem;
				font-weight: 700;
				color: #2d3748;
				text-transform: uppercase;
				letter-spacing: 0.05em;
			}
			.card-footer {
				display: flex;
				gap: 10px;
				justify-content: center;
			}
			.manage-btn {
				background: #1a202c !important;
				border: none !important;
				padding: 8px 18px !important;
				height: auto !important;
				line-height: inherit !important;
				border-radius: 8px !important;
				font-weight: 600 !important;
			}
			.manage-btn:hover {
				background: #CD2727 !important;
			}
			.add-btn {
				border-radius: 8px !important;
				padding: 8px 18px !important;
				height: auto !important;
				line-height: inherit !important;
				font-weight: 600 !important;
			}
		</style>
		<?php
	}
}
