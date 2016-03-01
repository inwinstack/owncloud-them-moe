<?php
script('files_sharing', 'settings-personal');
style('files_sharing', 'settings-personal');
if ($_['showShareIT']) {
	script('files_sharing', '3rdparty/gs-share/gs-share');
	style('files_sharing', '3rdparty/gs-share/style');
}
?>

<?php if ($_['outgoingServer2serverShareEnabled']): ?>
	<div id="fileSharingSettings" class="section">
		<h2><?php p($l->t('Federated Cloud')); ?></h2>

		<p>
			<?php p($l->t('Your Federated Cloud ID:')); ?>
			<strong><?php p($_['cloudId']); ?></strong>
		</p>

		<br>

	</div>
<?php endif; ?>

