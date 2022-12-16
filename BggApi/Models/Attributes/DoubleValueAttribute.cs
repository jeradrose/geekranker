using System.Xml;
using System.Xml.Serialization;

namespace BggApi.Models.Attributes; 

public class DoubleValueAttribute {
    [XmlAttribute("value")]
    public double Value { get; set; }
}
