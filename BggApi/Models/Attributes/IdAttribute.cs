using System.Xml.Serialization;

namespace BggApi.Models.Attributes;
public class IdAttribute : StringValueAttribute {
    [XmlAttribute("id")]
    public int Id { get; set; }
}
