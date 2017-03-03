<div id="app-navigation">
	<ul class="with-icon">
		<?php foreach ($_['navigationItems'] as $item) { ?>
		<li data-id="<?php p($item['id']) ?>" class="nav-<?php p($item['id']) ?>">
			<a href="<?php p(isset($item['href']) ? $item['href'] : '#') ?>"
				class="nav-icon-<?php p($item['icon'] !== '' ? $item['icon'] : $item['id']) ?> svg">
				<?php p($item['name']);?>
			</a>
		</li>
		<?php } ?>
		<li data-id="activity" class="nav-activity">
			<a href="/index.php/apps/activity/"
				class="nav-icon-activity">
				<span>所有活動</span>
			</a>
		</li>
	</ul>
</div>