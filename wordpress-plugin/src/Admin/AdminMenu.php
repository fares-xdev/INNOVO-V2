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
			'hero-slides'     => [ 'label' => __( 'Hero Slider', 'project-core' ), 'icon' => 'dashicons-images-alt2' ],
			'home-categories' => [ 'label' => __( 'Home Categories', 'project-core' ), 'icon' => 'dashicons-layout' ],
			'home-video'      => [ 'label' => __( 'Home Video', 'project-core' ), 'icon' => 'dashicons-video-alt3' ],
			'our-partners'    => [ 'label' => __( 'Our Partners', 'project-core' ), 'icon' => 'dashicons-groups' ],
			'our-customers'   => [ 'label' => __( 'Our Customers', 'project-core' ), 'icon' => 'dashicons-businessperson' ],
			'catalogue'       => [ 'label' => __( 'Catalogues', 'project-core' ), 'icon' => 'dashicons-pdf' ],
			'partners-slider' => [ 'label' => __( 'Logos Slider', 'project-core' ), 'icon' => 'dashicons-slides' ],
			'social-links'    => [ 'label' => __( 'Social Links', 'project-core' ), 'icon' => 'dashicons-share' ],
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
						<span style="background: #CD2727; color: white; padding: 6px 14px; border-radius: 99px; font-weight: 700; font-size: 0.875rem;">v <?php echo PROJECT_CORE_VERSION; ?></span>
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
								<a href="<?php echo esc_url( admin_url( "edit.php?post_type={$slug}" ) ); ?>" class="button button-primary manage-btn" style="width: 100%;">
									<?php _e( 'Manage Items', 'project-core' ); ?>
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
				background: #ffffff;
				padding: 40px 30px;
				border-radius: 20px;
				border: 1px solid #f1f5f9;
				text-align: center;
				transition: all 0.3s ease;
				box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
				display: flex;
				flex-direction: column;
				justify-content: space-between;
			}
			.project-core-card:hover {
				transform: translateY(-8px);
				box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
				border-color: #CD2727;
			}
			.icon-wrapper {
				background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
				width: 80px;
				height: 80px;
				margin: 0 auto 25px;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				transition: all 0.3s ease;
				border: 1px solid #f1f5f9;
			}
			.project-core-card:hover .icon-wrapper {
				background: #fff5f5;
				border-color: #fee2e2;
			}
			.project-core-card .dashicons {
				font-size: 36px;
				width: 36px;
				height: 36px;
				color: #475569;
				transition: color 0.3s;
			}
			.project-core-card:hover .dashicons {
				color: #CD2727;
			}
			.project-core-card h3 {
				margin: 0 0 30px 0;
				font-size: 1.15rem;
				font-weight: 700;
				color: #1e293b;
				letter-spacing: 0.02em;
				line-height: 1.4;
				text-transform: uppercase;
			}
			.card-footer {
				margin-top: auto;
			}
			.manage-btn {
				background: #0f172a !important;
				border: none !important;
				padding: 12px 20px !important;
				height: auto !important;
				line-height: 1 !important;
				border-radius: 12px !important;
				font-weight: 600 !important;
				font-size: 14px !important;
				transition: all 0.2s ease !important;
				box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1) !important;
			}
			.manage-btn:hover {
				background: #CD2727 !important;
				transform: scale(1.02);
				box-shadow: 0 10px 15px -3px rgba(205, 39, 39, 0.3) !important;
			}
		</style>
		<?php
	}
}
