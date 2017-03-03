<?php
/* Copyright (c) 2014, Joas Schilling nickvergessen@owncloud.com
 * This file is licensed under the Affero General Public License version 3
 * or later. See the COPYING-README file. */

/** @var $l OC_L10N */
/** @var $_ array */
?>
<div id="app-navigation"　class="activity-sidebar">
	<?php foreach ($_['navigations'] as $navigationGroup => $navigationEntries) { ?>
		<?php if ($navigationGroup !== 'apps'): ?><ul><?php endif; ?>

		<?php foreach ($navigationEntries as $navigation) { ?>
		<li<?php if ($_['activeNavigation'] === $navigation['id']): ?> class="active"<?php endif; ?>>
			<a data-navigation="<?php p($navigation['id']) ?>" href="<?php p($navigation['url']) ?>"
			   class="nav-icon-<?php p($navigation['icon']) ?> svg icon-width nav-icon-position">
				<?php p($navigation['name']) ?>
			</a>
		</li>
		<?php } ?>

		<?php if ($navigationGroup !== 'top'): ?></ul><?php endif; ?>
	<?php } ?>
</div>
