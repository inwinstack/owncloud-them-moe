<style type="text/css">

.terms-of-use h1{
    font-size: 2em;
    font-weight: bold;
    line-height: 1.5;
    padding-top: .3em;
}
.terms-of-use h2{
    font-size: 1.5em;
    line-height: 1.5;
    padding-top: .3em;
}
.terms-of-use ol{
    padding: .3em 0 0 2em;
}
.terms-of-use ol li,
.terms-of-use ul li{
    padding: .3em 0 0 0;
}
.terms-of-use ul{
    list-style-type: circle;
    padding: .3em 0 0 2em;
}
.terms-of-use p {
    padding: .3em;
}
.important {
    color:red;
    font-weight:bold;
}

#printWizard {
  float: left;
  background: #fff;
  border: 0;
  color: #18A6C4;
}

#acceptWizard {
  width: 100px;
}

.notify {
    font-weight:bold;
}

</style>

<div class="terms-of-use" id="printableArea" style="padding: 20px;">
    <header>
        <h1 style="text-align: center;">教育部雲端儲存應用服務使用說明</h1>
    </header>
    <p>
        <div>
           使用教育部雲端儲存應用服務（以下簡稱本服務）前，請仔細閱讀本使用說明（以下簡稱本說明）。
           如您同意本說明之內容，您即可使用本服務。<br> 
        </div> 
    </p>

    <p>
        <div class="notify">帳號有效期限<br></div>
        <div>
        若<span class="important">超過六個月未使用OpenID或TANet Roaming登入</span>本服務，系統將自動寄信至您留於本服務之電子信箱通知您，<span class="important">自通知日起六個月內</span>，本服務將持續每月寄信通知，自<span class="important">通知日起六個月後</span>，若您<span class="important">未曾再登入本服務</span>，本服務會<span class="important">將您帳號內的檔案資料刪除</span>。<br>
        </div>
    </p>
    
    <p>
    <div>
      	有關本服務使用者資通安全與個資蒐集，<span class="important">依教育體系資通安全暨個人資料管理規範辦理</span>。<br>
    </div>
    </p>
</div>
<div class="center" style="padding:20px">
<input id="printWizard" type="button" value=<?php p($l->t('Print')); ?> />
<label><input id="approveCheck" type="checkbox" name="checkbox" value="1">我已詳細閱讀，並同意接受以上內容。</label>
<input id="acceptWizard" disabled="disabled" type="button" value=<?php p($l->t('Accept')); ?> />
<input id="notAcceptWizard" type="button" value=<?php p($l->t("Not accept")); ?> />
</div>

