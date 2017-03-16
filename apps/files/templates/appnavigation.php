<div id="app-navigation">
	<ul class="with-icon">
		<?php foreach ($_['navigationItems'] as $item) { ?>
			<?php if ($item['id'] !== "sharinglinks") : ?>
				<li data-id="<?php p($item['id']) ?>" class="nav-<?php p($item['id']) ?>">
						<a href="<?php p(isset($item['href']) ? $item['href'] : '#') ?>"
							class="nav-icon-<?php p($item['icon'] !== '' ? $item['icon'] : $item['id']) ?> svg">
							<?php p($item['name']);?>
						</a>
				</li>
			<?php endif; ?>
		<?php } ?>
		<li data-id="activity" class="nav-activity">
			<a href=""
				class="nav-icon-activity">
				<span><?php p($l->t('All Activities'));?></span>
			</a>
		</li>
	</ul>
</div>
