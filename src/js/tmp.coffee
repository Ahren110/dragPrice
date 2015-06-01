tmp = '''
        <div class="yo-dragprogress-range">
            <div class="yo-dragprogress-range-bd" data-role="dp-progress">
                <a href="#" class="range-pointer" style="left: {{left}}%;" data-role="dp-scrubber" data-left="true"></a>
                <div class="range-bar" data-role="dp-progress-bar" style="width: {{width}}%; left: {{left}}%;"></div>
                <a href="#" class="range-pointer range-pointer-right" style="left: {{right}}%" data-role="dp-scrubber" data-right="true"></a>
            </div>
            <ul class="range-list">
                {{#prices}}
                <li data-role="dp-item-name" style="left: {{priceLeft}}%;"><span class="doc"><i class="yo-ico">&#xf083;</i></span><span class="price">{{priceName}}</span></li>
                {{/prices}}
            </ul>
        </div>
        '''
module.exports = tmp;
