from pydantic import BaseModel, Field
from typing import Literal

class PurchaseOrderFilters(BaseModel):
    OrderNumber: str | None = Field(default=None, description="Extract the purchase order number if mentioned in the user input, keywords like PO, order number, order#. If not mentioned, return null.")
    Status: Literal["PENDING APPROVAL", "OPEN", "CLOSED FOR INVOICING", "CLOSED FOR RECEIVING", "CLOSED"] | None = Field(default=None, description="Parse the user input and Extract the status of purchase order if they mentioned and normalize it to one of the following values: PENDING APPROVAL, OPEN, CLOSED FOR INVOICING, CLOSED FOR RECEIVING, CLOSED. If the status is not mentioned or cannot be determined, return null.")
    Supplier: str | None = Field(default=None, description="Extract the supplier name if mentioned in the user input I have given the detailed description in the prompt and extract accordingly. If not mentioned, return null.")
    Buyer: str | None = Field(default=None, description="Extract the buyer name if mentioned in the user input. If not mentioned, return null.")
    CreationDateON: str | None = Field(default=None,description=(
        "Extract a SINGLE exact creation date if the user specifies a specific day "
        "(e.g., 'on Feb 5', 'created on January 10', 'for 2024-01-15'). "
        "Convert all dates to YYYY-MM-DD format. "
        "Recognize both full and short month names (e.g., Jan, Feb, Mar). "
        "Use this field ONLY when exactly one specific date is mentioned with clear intent like 'on' or 'created on' or 'today'. "
        "If multiple dates or a range is mentioned, do NOT use this field."))
    CreationDateFrom: str | None = Field(default=None,description=(
        "Extract the START date when the user specifies a date range "
        "(e.g., 'from Feb 5 to Feb 10', 'between Jan 1 and Feb 1', 'Feb 10 and Feb 5'). "
        "Convert all dates to YYYY-MM-DD format. "
        "Recognize both full and short month names (Jan, Feb, etc.). "
        "If two dates are provided in any order, ALWAYS assign the EARLIER date to CreationDateFrom. "
        "If only one date is mentioned without 'on', treat it as CreationDateFrom."))
    CreationDateTo: str | None = Field(default=None,description=(
        "Extract the END date when the user specifies a date range "
        "(e.g., 'from Feb 5 to Feb 10', 'between Jan 1 and Feb 1', 'Feb 10 and Feb 5'). "
        "Convert all dates to YYYY-MM-DD format. "
        "Recognize both full and short month names (Jan, Feb, etc.). "
        "If two dates are provided in any order, ALWAYS assign the LATER date to CreationDateTo. "
        "If only one date is mentioned, do NOT populate this field."))
    AmountFrom: float | None = Field(default=None , description="Extract the minimum amount if mentioned in the user input. If user specifies an amount with keywords like 'greater than', 'more than', 'above', set AmountFrom to that number. If nothing is mentioned, return null.")
    AmountTo: float | None = Field(default=None, description="Extract the maximum amount if mentioned in the user input. If user specifies an amount with keywords like 'less than', 'fewer than', 'below', set AmountTo to that number. If nothing is mentioned, return null.")
    limit: int | None = Field(default=10, description="Extract the number of records to return if mentioned in the user input. If user says 'recent', set limit to 10. If user specifies a number, use that number. If nothing is mentioned, return 10.")
