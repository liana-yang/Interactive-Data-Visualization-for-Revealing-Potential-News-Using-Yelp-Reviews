/**
 * Created by Jiaqiang on 12/13/2015.
 */
function get_business_list_by_next_button(index, type, size, location, category, sort_key) {
    global_next_prev_click_times++;
    window.clickedBusinessID = '';
    get_businesses_list_based_on_abnormality_score(index, type, size, 10 * global_next_prev_click_times, location, category, sort_key);
}
function get_business_list_by_prev_button(index, type, size, location, category, sort_key) {
    if (global_next_prev_click_times > 0) {
        global_next_prev_click_times--;
        window.clickedBusinessID = '';
        get_businesses_list_based_on_abnormality_score(index, type, size, 10 * global_next_prev_click_times, location, category, sort_key);
    }
}