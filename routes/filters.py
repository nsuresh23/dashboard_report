from flask import Blueprint, jsonify
from services.data_service import DataService

# Blueprint for filters
filters_bp = Blueprint('filters', __name__)

# Initialize DataService with the Excel file path
data_service = DataService()

@filters_bp.route('/filter-data', methods=['POST'], endpoint='filter_data')
def filter_data():
    df = data_service.load_data()
    serialized_data = DataService.format_to_serializable(df)
    return jsonify(serialized_data.to_dict(orient='records'))
