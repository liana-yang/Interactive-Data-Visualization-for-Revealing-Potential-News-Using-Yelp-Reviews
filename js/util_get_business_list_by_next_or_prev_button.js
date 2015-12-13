/**
 * Created by Jiaqiang on 12/13/2015.
 */
function get_business_list_by_next_button(index, type, size, location, category) {
    global_next_prev_click_times++;
    get_businesses_list_based_on_abnormality_score(index, type, size, 10 * global_next_prev_click_times, location, category);
}
function get_business_list_by_prev_button(index, type, size, location, category) {
    if (global_next_prev_click_times > 0) {
        global_next_prev_click_times--;
    }
    get_businesses_list_based_on_abnormality_score(index, type, size, 10 * global_next_prev_click_times, location, category);
}