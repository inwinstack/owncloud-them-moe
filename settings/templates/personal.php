<?php /** opyright (c) 2011, Robin Appelman <icewind1991@gmail.com>
 * This file is licensed under the Affero General Public License version 3 or later.
 * See the COPYING-README file.
 */

/** @var $_ array */
/** @var $_['urlGenerator'] */
?>

<div id="app-navigation">
	<ul>
        <li><a href="#quota-stats"><?php p($l->t('Quota Stats')); ?></a></li>
        <li><a href="#avatar"><?php p($l->t('Profile picture')); ?></a></li>
        <li><a href="#goto-訊息通知"><?php p($l->t('Notifications')); ?></a></li>
        <li><a href="#clientsbox"><?php p($l->t('Get the apps to sync your files'));?></a></li>
        <li><a href="#terms-of-service"><?php p($l->t('Terms of service'));?></a></li>
        <li><a href="#training-videos"><?php p($l->t('Training Videos'));?></a></li>
	
        <?php foreach($_['forms'] as $form) {
            if (isset($form['anchor']) and !in_array($form['anchor'], ["clientsbox", "passwordform", "goto-訊息通知"])) {
                $anchor = '#' . $form['anchor'];
                $sectionName = $form['section-name'];
                print_unescaped(sprintf("<li><a href='%s'>%s</a></li>", OC_Util::sanitizeHTML($anchor), OC_Util::sanitizeHTML($sectionName)));
            }
        }?>
	</ul>
</div>

<div id="app-content">

<div id="quota-stats" class="section" style="padding: 30px 30px 0;margin-bottom: -15px;">
    <h2><?php p($l->t('Quota Stats')); ?></h2>
</div>

<div id="quota" class="section">
	<div style="width:<?php p($_['usage_relative']);?>%"
		<?php if($_['usage_relative'] > 80): ?> class="quota-warning" <?php endif; ?>>
		<p id="quotatext">
			<?php print_unescaped($l->t('You have used <strong>%s</strong> of the available <strong>%s</strong>',
			array($_['usage'], $_['total_space'])));?>
		</p>
	</div>
</div>

<?php if ($_['enableAvatars']): ?>
<form id="avatar" class="section" method="post" action="<?php p(\OC_Helper::linkToRoute('core.avatar.postAvatar')); ?>">
	<h2><?php p($l->t('Profile picture')); ?></h2>
	<div id="displayavatar">
		<div class="avatardiv"></div><br>
		<div class="warning hidden"></div>
		<?php if ($_['avatarChangeSupported']): ?>
		<label for="uploadavatar" class="inlineblock button" id="uploadavatarbutton"><?php p($l->t('Upload new')); ?></label>
		<div class="inlineblock button" id="selectavatar"><?php p($l->t('Select new from Files')); ?></div>
		<div class="inlineblock button" id="removeavatar"><?php p($l->t('Remove image')); ?></div>
		<input type="file" name="files[]" id="uploadavatar" class="hiddenuploadfield">
		<br>
		<?php p($l->t('Either png or jpg. Ideally square but you will be able to crop it. The file is not allowed to exceed the maximum size of 20 MB.')); ?>
		<?php else: ?>
		<?php p($l->t('Your avatar is provided by your original account.')); ?>
		<?php endif; ?>
	</div>
	<div id="cropper" class="hidden">
		<div class="inlineblock button" id="abortcropperbutton"><?php p($l->t('Cancel')); ?></div>
		<div class="inlineblock button primary" id="sendcropperbutton"><?php p($l->t('Choose as profile image')); ?></div>
	</div>
</form>
<?php endif; ?>

<?php foreach($_['forms'] as $form) {
	if (isset($form['form'])) {?>
	<div id="<?php isset($form['anchor']) ? p($form['anchor']) : p('');?>"><?php print_unescaped($form['form']);?></div>
	<?php }
};?>

<?php if($_['showCertificates']) : ?>
<div id="ssl-root-certificates" class="section">
	<h2><?php p($l->t('SSL root certificates')); ?></h2>
	<table id="sslCertificate" class="grid">
		<thead>
			<th><?php p($l->t('Common Name')); ?></th>
			<th><?php p($l->t('Valid until')); ?></th>
			<th><?php p($l->t('Issued By')); ?></th>
			<th/>
		</thead>
		<tbody>
			<?php foreach ($_['certs'] as $rootCert): /**@var \OCP\ICertificate $rootCert*/ ?>
				<tr class="<?php echo ($rootCert->isExpired()) ? 'expired' : 'valid' ?>" data-name="<?php p($rootCert->getName()) ?>">
					<td class="rootCert" title="<?php p($rootCert->getOrganization())?>">
						<?php p($rootCert->getCommonName()) ?>
					</td>
					<td title="<?php p($l->t('Valid until %s', $l->l('date', $rootCert->getExpireDate()))) ?>">
						<?php echo $l->l('date', $rootCert->getExpireDate()) ?>
					</td>
					<td title="<?php p($rootCert->getIssuerOrganization()) ?>">
						<?php p($rootCert->getIssuerName()) ?>
					</td>
					<td <?php if ($rootCert != ''): ?>class="remove"
						<?php else: ?>style="visibility:hidden;"
						<?php endif; ?>><img alt="<?php p($l->t('Delete')); ?>"
											 title="<?php p($l->t('Delete')); ?>"
											 class="svg action"
											 src="<?php print_unescaped(image_path('core', 'actions/delete.svg')); ?>"/>
					</td>
				</tr>
			<?php endforeach; ?>
		</tbody>
	</table>
	<form class="uploadButton" method="post" action="<?php p($_['urlGenerator']->linkToRoute('settings.Certificate.addPersonalRootCertificate')); ?>" target="certUploadFrame">
		<label for="rootcert_import" class="inlineblock button" id="rootcert_import_button"><?php p($l->t('Import root certificate')); ?></label>
		<input type="file" id="rootcert_import" name="rootcert_import" class="hiddenuploadfield">
	</form>
</div>
<?php endif; ?>

<div id="clientsbox" class="section">
	<h2><?php p($l->t('Get the apps to sync your files'));?></h2>
    
    <a href="https://storage.edu.tw/教育部雲端儲存桌面代理應用程式.exe" class="client">
        <span class="client-info"><?php p($l->t('Desktop client'));?></span>
        <span class="client-info">Windows 7, 8.x, 10</span>
    </a>
    
    <a href="https://storage.edu.tw/教育部雲端儲存桌面代理應用程式.pkg" class="client">
        <span class="client-info"><?php p($l->t('Desktop client'));?></span>
        <span class="client-info">Mac OSX 10.7+</span>
    </a>
    
    <a href="https://storage.edu.tw/Ubuntu_14.04-MOE-Storage-Cloud-Install.sh" class="client">
        <span class="client-info"><?php p($l->t('Desktop client'));?></span>
        <span class="client-info">Ubuntu 14.04</span>
    </a>
    
    <a href="<?php p($_['clients']['android']); ?>" class="client" target="_blank">
        <span class="client-info"><?php p($l->t('Mobile app'));?></span>
        <span class="client-info">Android 4.0+</span>
    </a>
    
    <a href="<?php p($_['clients']['ios']); ?>" class="client" target="_blank">
        <span class="client-info"><?php p($l->t('Mobile app'));?></span>
        <span class="client-info">iOS 8.0+</span>
    </a>
</div>

<div id="terms-of-service" class="section">
	<h2><?php p($l->t('Terms of service'));?></h2>
    
	<p><?php p($l->t('Storage quota is up to 5GB for each user.'));?><?php p($l->t('Retired teacher will be disabled in 6 months, please back up your files during the time.'));?></p>
</div>

<div id="training-videos" class="section">
	<h2><?php p($l->t('Training Videos')); ?></h2>
	
	<video width="400" controls>
		<source src="../../themes/MOE/ios.mp4" type="video/mp4"/>
	</video>
	
	<video width="400" controls>
		<source src="../../themes/MOE/android.mp4" type="video/mp4"/>
	</video>
</div>


</div>

