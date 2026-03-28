<?php

namespace ProjectCore\Core;

/**
 * Register all actions and filters for the plugin.
 *
 * Maintains a list of all hooks that are registered throughout
 * the plugin and then iterates over them to register with WordPress.
 *
 * @package ProjectCore\Core
 */
class Loader {

	/**
	 * @var array The actions registered with WordPress.
	 */
	protected $actions = [];

	/**
	 * @var array The filters registered with WordPress.
	 */
	protected $filters = [];

	/**
	 * Add a new action to the collection.
	 *
	 * @param string $hook      The name of the WordPress action.
	 * @param object $component A reference to the instance of the object.
	 * @param string $callback  The name of the function definition.
	 * @param int    $priority  The priority at which the function should be fired.
	 * @param int    $args      The number of arguments that should be passed to the callback.
	 */
	public function add_action( $hook, $component, $callback, $priority = 10, $args = 1 ) {
		$this->actions = $this->add( $this->actions, $hook, $component, $callback, $priority, $args );
	}

	/**
	 * Add a new filter to the collection.
	 *
	 * @param string $hook      The name of the WordPress filter.
	 * @param object $component A reference to the instance of the object.
	 * @param string $callback  The name of the function definition.
	 * @param int    $priority  The priority at which the function should be fired.
	 * @param int    $args      The number of arguments that should be passed to the callback.
	 */
	public function add_filter( $hook, $component, $callback, $priority = 10, $args = 1 ) {
		$this->filters = $this->add( $this->filters, $hook, $component, $callback, $priority, $args );
	}

	/**
	 * Utility function to add a hook to the collection.
	 */
	private function add( $hooks, $hook, $component, $callback, $priority, $args ) {
		$hooks[] = [
			'hook'      => $hook,
			'component' => $component,
			'callback'  => $callback,
			'priority'  => $priority,
			'args'      => $args,
		];

		return $hooks;
	}

	/**
	 * Register the filters and actions with WordPress.
	 */
	public function run() {
		foreach ( $this->filters as $hook ) {
			add_filter( $hook['hook'], [ $hook['component'], $hook['callback'] ], $hook['priority'], $hook['args'] );
		}

		foreach ( $this->actions as $hook ) {
			add_action( $hook['hook'], [ $hook['component'], $hook['callback'] ], $hook['priority'], $hook['args'] );
		}
	}
}
