<?php
$defaults = new OC_Defaults();
$config = \OC::$server->getConfig();
$clients = array(
        'android' => $config->getSystemValue('customclient_android', $defaults->getAndroidClientUrl()),
        'ios'     => $config->getSystemValue('customclient_ios', $defaults->getiOSClientUrl())
);
?>
<div id="app-content">
    <div id="downloads" style="float: left;text-align: center;">
    	<img style="float: left;" src="<?php print_unescaped(image_path('settings', 'app_download.png')); ?>" alt="" width="50%" height="50%">
    	<span style= "display:block"><?php p($l->t('Use the cloud storage service anytime, anywhere')); ?></span>
        <span><?php p($l->t('These files will be automatically synced to your other devices')); ?></span>
    	<div class="section">
    		<span style= "display:block">PC版</span>
            <a href="https://storage.edu.tw/教育部雲端儲存桌面代理應用程式.exe" class="client">
                <span class="client-info"><img src="<?php print_unescaped(image_path('settings', 'apps.svg')); ?>">Windows</span>
                <span class="client-info">7, 8.x, 10</span>
            </a>
            <a href="https://storage.edu.tw/教育部雲端儲存桌面代理應用程式.pkg" class="client">
                <span class="client-info"><img src="<?php print_unescaped(image_path('settings', 'apps.svg')); ?>">MAC OSX</span>
                <span class="client-info">10.7+</span>
            </a>
            <a href="https://storage.edu.tw/Ubuntu_14.04-MOE-Storage-Cloud-Install.sh" class="client">
                <span class="client-info"><img src="<?php print_unescaped(image_path('settings', 'apps.svg')); ?>">Ubuntu</span>
                <span class="client-info">14.04</span>
            </a>
        </div>
        <div class="section">
            <span style= "display:block">手機與平板</span>
            <a href="<?php p($clients['ios']); ?>" target="_blank">
            	<img width="10%" src="<?php print_unescaped(image_path('settings', 'ios.png')); ?>">
            </a>
             <a href="<?php p($clients['android']); ?>" target="_blank">
            	<img width="10%" src="<?php print_unescaped(image_path('settings', 'google.png')); ?>">
            </a>
        </div>
    </div>
</div>

