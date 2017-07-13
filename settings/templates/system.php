<?php
OC_Util::addScript('settings','raphael');
OC_Util::addScript('settings','Treant');
OC_Util::addScript('settings','connectors');
OC_Util::addStyle('settings','connectors');
OC_Util::addStyle('settings','perfect-scrollbar');
OC_Util::addStyle('settings','Treant');
OC_Util::addScript('settings','generateTree');
$defaults = new OC_Defaults();
$config = \OC::$server->getConfig();
$clients = array(
        'android' => $config->getSystemValue('customclient_android', $defaults->getAndroidClientUrl()),
        'ios'     => $config->getSystemValue('customclient_ios', $defaults->getiOSClientUrl())
);
?>
<div id="app-content">
    <div id="downloads" class="sections clearfix clientsbox center">
        <div class="client-left">
            <img src="<?php print_unescaped(image_path('settings', 'app_download.png')); ?>" alt="">
        </div>
        
        <div class="client-right">
            <div class="margin-bottom">
                <span class="client-title"><?php p($l->t('Use the cloud storage service anytime, anywhere')); ?></span>
                <span><?php p($l->t('These files will be automatically synced to your other devices')); ?></span>
            </div>
        
            <div class="margin-bottom">
                <span class="client-text">PC版</span>
                <a href="https://storage.edu.tw/教育部雲端儲存桌面代理應用程式.exe" class="client">
                    <img class="client-img" src="<?php print_unescaped(image_path('settings', 'windows-8.png')); ?>">
                    <span class="">Windows</span>
                    <span class="client-info">7, 8.x, 10</span>
                </a>
                <a href="https://storage.edu.tw/教育部雲端儲存桌面代理應用程式.pkg" class="client">
                    <img class="client-img" src="<?php print_unescaped(image_path('settings', 'apple-big-logo.png')); ?>">
                    <span class="">MAC OSX</span>
                    <span class="client-info">10.7+</span>
                </a>
                <a href="https://storage.edu.tw/Ubuntu_14.04-MOE-Storage-Cloud-Install.sh" class="client">
                    <img class="client-img" src="<?php print_unescaped(image_path('settings', 'Ubuntu.png')); ?>">
                    <span class="">Ubuntu</span>
                    <span class="client-info">14.04</span>
                </a>
            </div>
            
            <div class="margin-bottom">
                <span class="client-text">手機與平板</span>
                <div style="display: inline-block;">
                    <a style="display: block;" href="<?php p($clients['ios']); ?>" target="_blank">
                        <img class="client-store" src="<?php print_unescaped(image_path('settings', 'ios.png')); ?>">
                    </a>
                    
                    <img class="client-store" src="<?php print_unescaped(image_path('settings', 'iOS App Download.jpg')); ?>">
                </div>
                
                <div style="display: inline-block;">
                    <a style="display: block;" href="<?php p($clients['android']); ?>" target="_blank">
                        <img class="client-store" src="<?php print_unescaped(image_path('settings', 'google.png')); ?>">
                    </a>
                    <img class="client-store" src="<?php print_unescaped(image_path('settings', 'Android App Download.jpg')); ?>">
                </div>
            </div>
        </div>
        <div class="chart" id="OrganiseChart-big-commpany"></div>
    </div>
</div>

