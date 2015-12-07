/**
 * Created by Jiaqiang on 12/6/2015.
 */
function load_file_and_bulk_create(source_file_name) {
    d3.text(source_file_name, function(result){
        bulk_create(result);
    });
}
function bulk_create(json_array) {
    var temp = JSON.parse(json_array);
    client.bulk({
        body: temp
    });
}
function load_file_and_bulk_delete(source_file_name) {
    d3.json(source_file_name, function(result){
        client.bulk({
            body: result
        });
    });
}