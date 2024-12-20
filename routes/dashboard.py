from flask import Blueprint, render_template, jsonify, request
from services.data_service import DataService

# Blueprint for dashboard
dashboard_bp = Blueprint('dashboard', __name__)

# Initialize DataService
data_service = DataService()

@dashboard_bp.route('/')
def index():
    return render_template('dashboard.html')

@dashboard_bp.route('/get-data', methods=['POST'], endpoint='get_data')
def get_data():
    df = data_service.load_data()
    df = DataService.format_date_column(df, column_name="date")

    filters = {}

    if request.form.get("type_of_import"):
        filters["type_of_import"] = request.form.get("type_of_import").split(",")
    if request.form.get("batch_name"):
        filters["batch_name"] = request.form.get("batch_name").split(",")
    if request.form.get("object_type"):
        filters["object_type"] = request.form.get("object_type").split(",")

    # Apply filters
    filtered_df = DataService.filter_data(df, filters)
    head_df = filtered_df.head(10)
    print(head_df)
    total_summary = data_service.get_total_summary(filtered_df)
    serialized_data = DataService.format_to_serializable(filtered_df)
    return jsonify(
        {
            "totals": total_summary,
            "data": serialized_data.to_dict(orient='records'),
        }
    )   
